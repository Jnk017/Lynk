import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LegalAcceptance } from './entities/legal-acceptance.entity';
import { AcceptLegalDocumentDto, DeleteAccountDto } from './dto/legal.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../user/entities/user.entity';

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}
export interface ChatExport {
  id: string;
  content: string | null;
  createdAt: Date;
  chatRoomId: string;
  senderId: string;
}
export interface ReportExport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string | null;
  evidenceNote: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface WalletExport {
  id: string;
  type: string;
  currency: string;
  amount: string;
  provider: string;
  status: string;
  externalRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LegalService {
  constructor(
    @InjectRepository(LegalAcceptance)
    private readonly acceptances: Repository<LegalAcceptance>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly auditLog: AuditLogService,
    private readonly dataSource: DataSource,
  ) {}

  async accept(
    userId: string,
    dto: AcceptLegalDocumentDto,
    context: RequestContext,
  ) {
    const existing = await this.acceptances.findOne({
      where: {
        userId,
        documentType: dto.documentType,
        documentVersion: dto.documentVersion,
        revokedAt: IsNull(),
      },
    });
    if (existing) return existing;
    const acceptance = await this.acceptances.save(
      this.acceptances.create({ userId, ...dto, ...context }),
    );
    await this.auditLog.record({
      action: 'legal.acceptance',
      actorUserId: userId,
      targetType: 'legal_document',
      targetId: acceptance.id,
      metadata: {
        documentType: dto.documentType,
        documentVersion: dto.documentVersion,
        language: dto.language,
        ...context,
      },
    });
    return acceptance;
  }

  async list(userId: string) {
    return this.acceptances.find({
      where: { userId },
      order: { acceptedAt: 'DESC' },
    });
  }

  async revoke(userId: string, id: string, context: RequestContext) {
    const acceptance = await this.acceptances.findOne({
      where: { id, userId },
    });
    if (!acceptance) throw new NotFoundException('Legal acceptance not found');
    acceptance.revokedAt = new Date();
    await this.acceptances.save(acceptance);
    await this.auditLog.record({
      action: 'legal.revocation',
      actorUserId: userId,
      targetType: 'legal_acceptance',
      targetId: id,
      metadata: { ...context },
    });
    return acceptance;
  }

  async exportData(userId: string, context: RequestContext) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['media', 'prompts'],
    });
    if (!user) throw new NotFoundException('User not found');
    const [chats, reports, walletHistory, legalAcceptances] = await Promise.all(
      [
        this.dataSource.query<ChatExport[]>(
          `SELECT m.id, m.content, m."createdAt", m."chatRoomId", m."senderId" FROM messages m JOIN chat_participants cp ON cp."chatRoomId" = m."chatRoomId" WHERE cp."userId" = $1 ORDER BY m."createdAt"`,
          [userId],
        ),
        this.dataSource.query<ReportExport[]>(
          `SELECT "id", "reporterId", "reportedUserId", "reason", "details", "evidenceNote", "status", "createdAt", "updatedAt" FROM reports WHERE "reporterId" = $1 OR "reportedUserId" = $1 ORDER BY "createdAt"`,
          [userId],
        ),
        this.dataSource.query<WalletExport[]>(
          `SELECT "id", "type", "currency", "amount", "provider", "status", "externalRef", "createdAt", "updatedAt" FROM transactions WHERE "userId" = $1 ORDER BY "createdAt"`,
          [userId],
        ),
        this.acceptances.find({
          where: { userId },
          order: { acceptedAt: 'ASC' },
        }),
      ],
    );
    await this.auditLog.record({
      action: 'privacy.export_requested',
      actorUserId: userId,
      targetType: 'user',
      targetId: userId,
      metadata: { ...context },
    });
    const profile = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      bio: user.bio,
      birthdate: user.birthdate,
      gender: user.gender,
      lifestyleTags: user.lifestyleTags,
      location: user.location,
      preferences: user.preferences,
      prompts: user.prompts,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletionRequestedAt: user.deletionRequestedAt,
      deletionScheduledFor: user.deletionScheduledFor,
    };
    return {
      generatedAt: new Date().toISOString(),
      formatVersion: '1.0',
      profile,
      photos: user.media,
      chats,
      verification: {
        status: user.verificationStatus,
        kycDocumentUrl: user.kycDocumentUrl,
        livenessVideoUrl: user.livenessVideoUrl,
      },
      reports,
      walletHistory,
      legalAcceptances,
    };
  }

  async requestDeletion(
    userId: string,
    dto: DeleteAccountDto,
    context: RequestContext,
  ) {
    if (!dto.confirmDeletion)
      throw new BadRequestException('Deletion consequences must be confirmed');
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (
      !user.passwordHash ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    )
      throw new UnauthorizedException('Password verification failed');
    const now = new Date();
    const scheduledFor = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    user.deletionRequestedAt = now;
    user.deletionScheduledFor = scheduledFor;
    await this.users.save(user);
    await this.auditLog.record({
      action: 'privacy.deletion_requested',
      actorUserId: userId,
      targetType: 'user',
      targetId: userId,
      metadata: { scheduledFor: scheduledFor.toISOString(), ...context },
    });
    return {
      status: 'grace_period',
      requestedAt: now,
      scheduledFor,
      cancellationAvailable: true,
    };
  }

  async cancelDeletion(userId: string, context: RequestContext) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.deletionRequestedAt = null;
    user.deletionScheduledFor = null;
    await this.users.save(user);
    await this.auditLog.record({
      action: 'privacy.deletion_cancelled',
      actorUserId: userId,
      targetType: 'user',
      targetId: userId,
      metadata: { ...context },
    });
    return { status: 'active' };
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { MatchStatus, ReportStatus } from '../../common/enums';
import { ObservabilityEventName } from '../observability/observability-events';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Match } from '../matchmaking/entities/match.entity';
import { ObservabilityService } from '../observability/observability.service';
import { User } from '../user/entities/user.entity';
import { CreateReportDto } from './dto/moderation.dto';
import { Report } from './entities/report.entity';
import { UserBlock } from './entities/user-block.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(UserBlock)
    private readonly blockRepository: Repository<UserBlock>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly auditLogService: AuditLogService,
    @Optional() private readonly observabilityService?: ObservabilityService,
  ) {}

  async createReport(
    reporterId: string,
    input: CreateReportDto,
  ): Promise<Report> {
    if (reporterId === input.reportedUserId) {
      throw new BadRequestException('You cannot report your own profile');
    }
    await this.assertUserExists(input.reportedUserId);
    const report = await this.reportRepository.save({
      reporterId,
      reportedUserId: input.reportedUserId,
      reason: input.reason,
      details: input.details?.trim() || null,
      evidenceNote: input.evidenceNote?.trim() || null,
      status: ReportStatus.PENDING,
    });
    await this.auditLogService.record({
      action: 'moderation.report.created',
      actorUserId: reporterId,
      targetType: 'Report',
      targetId: report.id,
      metadata: { reportedUserId: input.reportedUserId, reason: input.reason },
    });
    void this.observabilityService?.track(
      ObservabilityEventName.REPORT_CREATED,
      reporterId,
      {
        reportId: report.id,
        reason: input.reason,
      },
    );
    void this.observabilityService?.track(
      ObservabilityEventName.REPORT_SUBMITTED,
      reporterId,
      {
        reportId: report.id,
      },
    );
    return report;
  }

  listMyReports(reporterId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { reporterId },
      select: [
        'id',
        'reportedUserId',
        'reason',
        'status',
        'resolutionNote',
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async blockUser(
    blockerId: string,
    blockedUserId: string,
  ): Promise<UserBlock> {
    if (blockerId === blockedUserId)
      throw new BadRequestException('You cannot block yourself');
    await this.assertUserExists(blockedUserId);
    const existing = await this.blockRepository.findOne({
      where: { blockerId, blockedUserId },
    });
    if (existing) throw new ConflictException('This member is already blocked');

    const block = await this.blockRepository.save({ blockerId, blockedUserId });
    await this.matchRepository
      .createQueryBuilder()
      .update(Match)
      .set({ status: MatchStatus.UNMATCHED })
      .where(
        new Brackets((query) => {
          query
            .where(
              '"initiatorId" = :blockerId AND "receiverId" = :blockedUserId',
            )
            .orWhere(
              '"initiatorId" = :blockedUserId AND "receiverId" = :blockerId',
            );
        }),
      )
      .setParameters({ blockerId, blockedUserId })
      .execute();
    await this.auditLogService.record({
      action: 'moderation.user.blocked',
      actorUserId: blockerId,
      targetType: 'User',
      targetId: blockedUserId,
    });
    void this.observabilityService?.track(
      ObservabilityEventName.USER_BLOCKED,
      blockerId,
      { blockedUserId },
    );
    return block;
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const result = await this.blockRepository.delete({
      blockerId,
      blockedUserId,
    });
    if (!result.affected)
      throw new NotFoundException('Blocked member not found');
    await this.auditLogService.record({
      action: 'moderation.user.unblocked',
      actorUserId: blockerId,
      targetType: 'User',
      targetId: blockedUserId,
    });
    void this.observabilityService?.track(
      ObservabilityEventName.USER_UNBLOCKED,
      blockerId,
      { blockedUserId },
    );
  }

  async listBlockedUsers(blockerId: string): Promise<
    Array<{
      id: string;
      blockedUserId: string;
      createdAt: Date;
      blockedUser: {
        id: string;
        displayName: string;
        media: Array<{
          id: string;
          type: string;
          url: string;
          orderIndex: number;
        }>;
      };
    }>
  > {
    const blocks = await this.blockRepository.find({
      where: { blockerId },
      relations: ['blockedUser', 'blockedUser.media'],
      order: { createdAt: 'DESC' },
    });
    return blocks.map((block) => ({
      id: block.id,
      blockedUserId: block.blockedUserId,
      createdAt: block.createdAt,
      blockedUser: {
        id: block.blockedUser.id,
        displayName: block.blockedUser.displayName,
        media: (block.blockedUser.media || []).map((media) => ({
          id: media.id,
          type: media.type,
          url: media.url,
          orderIndex: media.orderIndex,
        })),
      },
    }));
  }

  async isBlockedBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<boolean> {
    return this.blockRepository
      .createQueryBuilder('block')
      .where(
        '(block.blockerId = :firstUserId AND block.blockedUserId = :secondUserId)',
        { firstUserId, secondUserId },
      )
      .orWhere(
        '(block.blockerId = :secondUserId AND block.blockedUserId = :firstUserId)',
        { firstUserId, secondUserId },
      )
      .getExists();
  }

  async assertInteractionAllowed(
    firstUserId: string,
    secondUserId: string,
  ): Promise<void> {
    if (await this.isBlockedBetween(firstUserId, secondUserId)) {
      throw new ForbiddenException(
        'This interaction is unavailable because one member has blocked the other',
      );
    }
  }

  async blockedUserIdsFor(userId: string): Promise<string[]> {
    const rows = await this.blockRepository
      .createQueryBuilder('block')
      .where('block.blockerId = :userId OR block.blockedUserId = :userId', {
        userId,
      })
      .getMany();
    return rows.map((block) =>
      block.blockerId === userId ? block.blockedUserId : block.blockerId,
    );
  }

  private async assertUserExists(userId: string): Promise<void> {
    if (!(await this.userRepository.exist({ where: { id: userId } }))) {
      throw new NotFoundException('User not found');
    }
  }
}

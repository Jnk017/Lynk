import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { Founder } from '../founder/entities/founder.entity';
import { RevenueDistribution } from '../referral/entities/revenue-distribution.entity';
import { ReferralService } from '../referral/referral.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { Report } from '../moderation/entities/report.entity';
import { ReportStatus } from '../../common/enums';

interface AdminActor {
  id: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Founder)
    private readonly founderRepository: Repository<Founder>,
    @InjectRepository(RevenueDistribution)
    private readonly revenueDistributionRepository: Repository<RevenueDistribution>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly referralService: ReferralService,
    private readonly auditLogService: AuditLogService,
    private readonly systemSettingsService: SystemSettingsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  listUsers(input: PaginationInput = {}): Promise<User[]> {
    const { skip, take } = this.getPagination(input);
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async getUserDetail(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async suspendUser(
    actor: AdminActor,
    userId: string,
    reason: string,
  ): Promise<User> {
    const user = await this.getUserDetail(userId);
    await this.userRepository.update(userId, {
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason,
    });
    await this.auditLogService.record({
      action: 'admin.user.suspend',
      actorUserId: actor.id,
      targetType: 'User',
      targetId: userId,
      metadata: { reason },
    });
    return { ...user, isBanned: true, bannedAt: new Date(), banReason: reason };
  }

  async restoreUser(actor: AdminActor, userId: string): Promise<User> {
    const user = await this.getUserDetail(userId);
    await this.userRepository.update(userId, {
      isBanned: false,
      bannedAt: null,
      banReason: null,
    });
    await this.auditLogService.record({
      action: 'admin.user.restore',
      actorUserId: actor.id,
      targetType: 'User',
      targetId: userId,
      metadata: {},
    });
    return { ...user, isBanned: false, bannedAt: null, banReason: null };
  }

  listReports(input: PaginationInput = {}): Promise<Report[]> {
    const { skip, take } = this.getPagination(input);
    return this.reportRepository.find({
      relations: ['reporter', 'reportedUser', 'resolvedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async resolveReport(
    actor: AdminActor,
    reportId: string,
    status: ReportStatus.RESOLVED | ReportStatus.DISMISSED,
    resolution: string,
  ): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    const resolvedAt = new Date();
    const updated = await this.reportRepository.save({
      ...report,
      status,
      resolution,
      resolvedById: actor.id,
      resolvedAt,
    });
    await this.auditLogService.record({
      action: 'admin.report.resolve',
      actorUserId: actor.id,
      targetType: 'Report',
      targetId: reportId,
      metadata: { status, resolution },
    });
    return updated;
  }

  listTransactions(input: PaginationInput = {}): Promise<Transaction[]> {
    const { skip, take } = this.getPagination(input);
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  listFounders(input: PaginationInput = {}): Promise<Founder[]> {
    const { skip, take } = this.getPagination(input);
    return this.founderRepository.find({
      relations: ['user'],
      order: { founderNumber: 'ASC' },
      skip,
      take,
    });
  }

  listRevenueDistributions(
    input: PaginationInput = {},
  ): Promise<RevenueDistribution[]> {
    const { skip, take } = this.getPagination(input);
    return this.revenueDistributionRepository.find({
      relations: ['pool', 'founder'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async dryRunRevenueSharing(actor: AdminActor, month: string) {
    const result = await this.referralService.distributeMonthlyDividends(
      month,
      {
        dryRun: true,
      },
    );
    await this.auditLogService.record({
      action: 'admin.revenue_sharing.dry_run',
      actorUserId: actor.id,
      targetType: 'RevenueDistribution',
      targetId: month,
      metadata: { ...result },
    });
    return result;
  }

  listSystemSettings() {
    return this.systemSettingsService.list(true);
  }

  async upsertSystemSetting(
    actor: AdminActor,
    key: string,
    input: { value: Record<string, unknown>; isPublic?: boolean },
  ) {
    const setting = await this.systemSettingsService.upsert(key, input);
    await this.auditLogService.record({
      action: 'admin.system_settings.upsert',
      actorUserId: actor.id,
      targetType: 'SystemSetting',
      targetId: setting.id,
      metadata: { key, isPublic: setting.isPublic },
    });
    return setting;
  }

  listFeatureFlags() {
    return this.featureFlagService.list();
  }

  async upsertFeatureFlag(
    actor: AdminActor,
    key: string,
    input: { enabled: boolean; rules?: Record<string, unknown> },
  ) {
    const flag = await this.featureFlagService.upsert(key, input);
    await this.auditLogService.record({
      action: 'admin.feature_flags.upsert',
      actorUserId: actor.id,
      targetType: 'FeatureFlag',
      targetId: flag.id,
      metadata: { key, enabled: flag.enabled },
    });
    return flag;
  }

  private getPagination(input: PaginationInput): {
    skip: number;
    take: number;
  } {
    const page = Math.max(1, Number(input.page || 1));
    const limit = Math.min(100, Math.max(1, Number(input.limit || 20)));
    return { skip: (page - 1) * limit, take: limit };
  }
}

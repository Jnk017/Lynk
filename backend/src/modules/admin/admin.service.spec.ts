import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { Founder } from '../founder/entities/founder.entity';
import { RevenueDistribution } from '../referral/entities/revenue-distribution.entity';
import { ReferralService } from '../referral/referral.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { UserService } from '../user/user.service';
import { Report } from '../moderation/entities/report.entity';
import { ReportStatus, RevenuePoolStatus } from '../../common/enums';

interface RepositoryMock<T extends object> {
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  update: jest.Mock<Promise<unknown>, [unknown, Partial<T>]>;
  save: jest.Mock<Promise<T>, [Partial<T>]>;
}

function createRepositoryMock<T extends object>(): RepositoryMock<T> {
  return {
    find: jest.fn<Promise<T[]>, [unknown?]>().mockResolvedValue([]),
    findOne: jest.fn<Promise<T | null>, [unknown]>().mockResolvedValue(null),
    update: jest
      .fn<Promise<unknown>, [unknown, Partial<T>]>()
      .mockResolvedValue({ affected: 1 }),
    save: jest
      .fn<Promise<T>, [Partial<T>]>()
      .mockImplementation((input: Partial<T>) => Promise.resolve(input as T)),
  };
}

describe('AdminService', () => {
  let userRepository: RepositoryMock<User>;
  let reportRepository: RepositoryMock<Report>;
  let auditLogService: jest.Mocked<Pick<AuditLogService, 'record'>>;
  let referralService: jest.Mocked<
    Pick<ReferralService, 'distributeMonthlyDividends'>
  >;
  let systemSettingsService: jest.Mocked<
    Pick<SystemSettingsService, 'list' | 'upsert'>
  >;
  let featureFlagService: jest.Mocked<
    Pick<FeatureFlagService, 'list' | 'upsert'>
  >;
  let userService: jest.Mocked<
    Pick<UserService, 'markVerified' | 'rejectVerification'>
  >;
  let service: AdminService;

  beforeEach(() => {
    userRepository = createRepositoryMock<User>();
    reportRepository = createRepositoryMock<Report>();
    auditLogService = { record: jest.fn().mockResolvedValue({}) };
    referralService = {
      distributeMonthlyDividends: jest.fn().mockResolvedValue({
        period: '2026-05',
        dryRun: true,
        idempotent: false,
        status: RevenuePoolStatus.CALCULATING,
        totalRevenue: 1000,
        revenueSharingPercentage: 0.05,
        distributableAmount: 50,
        activeFounderCount: 2,
        dividendPerFounder: 25,
        distributionCount: 2,
      }),
    };
    systemSettingsService = {
      list: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({ id: 'setting-1', isPublic: false }),
    };
    featureFlagService = {
      list: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({ id: 'flag-1', enabled: true }),
    };
    userService = {
      markVerified: jest.fn().mockResolvedValue({ id: 'user-1' }),
      rejectVerification: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };

    service = new AdminService(
      userRepository as unknown as Repository<User>,
      createRepositoryMock<Transaction>() as unknown as Repository<Transaction>,
      createRepositoryMock<Founder>() as unknown as Repository<Founder>,
      createRepositoryMock<RevenueDistribution>() as unknown as Repository<RevenueDistribution>,
      reportRepository as unknown as Repository<Report>,
      referralService as unknown as ReferralService,
      auditLogService as unknown as AuditLogService,
      systemSettingsService as unknown as SystemSettingsService,
      featureFlagService as unknown as FeatureFlagService,
      userService as unknown as UserService,
    );
  });

  it('suspends users and records an audit log', async () => {
    userRepository.findOne.mockResolvedValueOnce({ id: 'user-1' } as User);

    await service.suspendUser({ id: 'admin-1' }, 'user-1', 'policy abuse');

    const updatePayload = userRepository.update.mock.calls[0][1];
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        isBanned: true,
        banReason: 'policy abuse',
      }),
    );
    expect(updatePayload.bannedAt).toBeInstanceOf(Date);
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.user.suspend',
        actorUserId: 'admin-1',
        targetType: 'User',
        targetId: 'user-1',
      }),
    );
  });

  it('resolves reports and records an audit log', async () => {
    reportRepository.findOne.mockResolvedValueOnce({
      id: 'report-1',
    } as Report);

    await service.resolveReport(
      { id: 'moderator-1' },
      'report-1',
      ReportStatus.RESOLVED,
      'warning sent',
    );

    expect(reportRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'report-1',
        status: ReportStatus.RESOLVED,
        resolution: 'warning sent',
        resolvedById: 'moderator-1',
      }),
    );
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin.report.resolve' }),
    );
  });

  it('audits dry-run revenue sharing previews', async () => {
    const result = await service.dryRunRevenueSharing(
      { id: 'admin-1' },
      '2026-05',
    );

    expect(result.dryRun).toBe(true);
    expect(referralService.distributeMonthlyDividends).toHaveBeenCalledWith(
      '2026-05',
      { dryRun: true },
    );
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.revenue_sharing.dry_run',
        actorUserId: 'admin-1',
      }),
    );
  });

  it('audits system setting changes', async () => {
    await service.upsertSystemSetting({ id: 'super-1' }, 'founder_limit', {
      value: { value: 2500 },
      isPublic: false,
    });

    expect(systemSettingsService.upsert).toHaveBeenCalledWith('founder_limit', {
      value: { value: 2500 },
      isPublic: false,
    });
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.system_settings.upsert',
        actorUserId: 'super-1',
      }),
    );
  });
});

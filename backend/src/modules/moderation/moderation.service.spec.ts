import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReportReason, ReportStatus } from '../../common/enums';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Match } from '../matchmaking/entities/match.entity';
import { ObservabilityService } from '../observability/observability.service';
import { User } from '../user/entities/user.entity';
import { Report } from './entities/report.entity';
import { UserBlock } from './entities/user-block.entity';
import { ModerationService } from './moderation.service';

function repository<T extends object>() {
  return {
    save: jest
      .fn()
      .mockImplementation((input) =>
        Promise.resolve({ id: 'saved-id', ...input }),
      ),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    exist: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('ModerationService', () => {
  const reportRepository = repository<Report>();
  const blockRepository = repository<UserBlock>();
  const userRepository = repository<User>();
  const matchRepository = repository<Match>();
  const auditLogService = { record: jest.fn().mockResolvedValue({}) };
  const observabilityService = {
    track: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ModerationService(
    reportRepository,
    blockRepository,
    userRepository,
    matchRepository,
    auditLogService as unknown as AuditLogService,
    observabilityService as unknown as ObservabilityService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a non-punitive pending report and audits it', async () => {
    const result = await service.createReport('reporter-1', {
      reportedUserId: 'reported-1',
      reason: ReportReason.HARASSMENT,
      details: 'Repeated unwanted contact',
      evidenceNote: 'Conversation from June 4',
    });

    const savedReport = reportRepository.save.mock
      .calls[0][0] as Partial<Report>;
    expect(savedReport.status).toBe(ReportStatus.PENDING);
    expect(savedReport.reason).toBe(ReportReason.HARASSMENT);
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'moderation.report.created',
        actorUserId: 'reporter-1',
      }),
    );
    expect(result.status).toBe(ReportStatus.PENDING);
  });

  it('rejects self-reporting', async () => {
    await expect(
      service.createReport('same-user', {
        reportedUserId: 'same-user',
        reason: ReportReason.OTHER,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents interactions when either member has blocked the other', async () => {
    const query = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getExists: jest.fn().mockResolvedValue(true),
    };
    blockRepository.createQueryBuilder.mockReturnValue(query as never);
    await expect(
      service.assertInteractionAllowed('member-a', 'member-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('keeps moderator identity out of member report-history selections', async () => {
    await service.listMyReports('reporter-1');
    const options = reportRepository.find.mock.calls[0][0];
    expect(JSON.stringify(options.select)).not.toContain('moderatorId');
    expect(JSON.stringify(options.select)).not.toContain('moderator');
  });
});

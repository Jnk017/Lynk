import { DataSource, Repository } from 'typeorm';
import { ReferralStatus } from '../../common/enums';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from './entities/referral-log.entity';
import { RevenueDistribution } from './entities/revenue-distribution.entity';
import { RevenuePool } from './entities/revenue-pool.entity';
import { ReferralService } from './referral.service';

function buildService(referralLog: ReferralLog | null) {
  const userRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
    update: jest.fn(),
  };
  const referralLogRepository = {
    findOne: jest.fn<Promise<ReferralLog | null>, [unknown]>().mockResolvedValue(referralLog),
    save: jest.fn<Promise<ReferralLog>, [ReferralLog]>(),
  };

  const service = new ReferralService(
    userRepository as unknown as Repository<User>,
    referralLogRepository as unknown as Repository<ReferralLog>,
    {} as Repository<RevenuePool>,
    {} as Repository<RevenueDistribution>,
    {} as DataSource,
    { getNumber: jest.fn() } as unknown as SystemSettingsService,
    { record: jest.fn() } as unknown as AuditLogService,
  );

  return { referralLogRepository, service, userRepository };
}

describe('ReferralService referral reward idempotency', () => {
  it('does not re-award an already verified referral', async () => {
    const referralLog = Object.assign(new ReferralLog(), {
      id: 'referral-1',
      referrerId: 'founder-1',
      refereeId: 'user-1',
      verificationPassed: true,
      countsForRevenueSharing: true,
      status: ReferralStatus.VERIFIED,
    });
    const { referralLogRepository, service, userRepository } =
      buildService(referralLog);

    await service.onUserVerified('user-1');

    expect(referralLogRepository.findOne).toHaveBeenCalledWith({
      where: { refereeId: 'user-1' },
    });
    expect(referralLogRepository.save).not.toHaveBeenCalled();
    expect(userRepository.increment).not.toHaveBeenCalled();
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('does not reward when no referral log exists for the verified user', async () => {
    const { referralLogRepository, service, userRepository } = buildService(null);

    await service.onUserVerified('user-without-referral');

    expect(referralLogRepository.findOne).toHaveBeenCalledWith({
      where: { refereeId: 'user-without-referral' },
    });
    expect(referralLogRepository.save).not.toHaveBeenCalled();
    expect(userRepository.increment).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

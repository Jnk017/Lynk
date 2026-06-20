jest.mock('uuid', () => ({
  v4: () => '00000000-0000-4000-8000-000000000001',
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: { uid: 'pi-user-1', username: 'pi_alex' },
    }),
  },
}));

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { FounderService } from '../founder/founder.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('AuthService Pi authentication', () => {
  it('rejects a client Pi UID that does not match the Pi API UID', async () => {
    const userRepository = { findOne: jest.fn() };
    const service = new AuthService(
      userRepository as unknown as Repository<User>,
      {} as Repository<ReferralLog>,
      { save: jest.fn() } as unknown as Repository<RefreshToken>,
      new JwtService(),
      { get: jest.fn() } as unknown as ConfigService,
      {} as DataSource,
      {} as FounderService,
      { record: jest.fn() } as unknown as AuditLogService,
    );

    await expect(
      service.loginWithPi({ uid: 'wrong-user', accessToken: 'token' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });
});

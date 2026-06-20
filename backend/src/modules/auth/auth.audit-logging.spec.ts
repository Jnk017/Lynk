jest.mock('uuid', () => ({
  v4: () => '00000000-0000-4000-8000-000000000046',
}));

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { FounderService } from '../founder/founder.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserRole } from '../../common/enums';

const accessKey = 'test_access_key_minimum_32_chars';
const refreshKey = 'test_refresh_key_minimum_32_chars';

async function makeUser(): Promise<User> {
  const entity = new User();
  entity.id = 'user-1';
  entity.email = 'user@example.com';
  entity.phone = null;
  entity.passwordHash = await bcrypt.hash('ValidPassword123!', 12);
  entity.role = UserRole.USER;
  entity.isBanned = false;
  return entity;
}

function buildService(user: User) {
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(user),
  };
  const refreshTokenRepository = {
    save: jest.fn((value: Partial<RefreshToken>) => Promise.resolve(value)),
  };
  const auditLogService = { record: jest.fn() };
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.accessSecret': accessKey,
        'jwt.refreshSecret': refreshKey,
        'jwt.refreshExpiresIn': '30d',
      };
      return values[key];
    }),
  };

  const authService = new AuthService(
    userRepository as unknown as Repository<User>,
    {} as Repository<ReferralLog>,
    refreshTokenRepository as unknown as Repository<RefreshToken>,
    new JwtService(),
    configService as unknown as ConfigService,
    {} as DataSource,
    {} as FounderService,
    auditLogService as unknown as AuditLogService,
  );

  return { auditLogService, authService, refreshTokenRepository };
}

describe('AuthService audit logging', () => {
  it('writes contextual audit logs for password login', async () => {
    const user = await makeUser();
    const { auditLogService, authService, refreshTokenRepository } =
      buildService(user);

    await authService.login(
      {
        email: 'user@example.com',
        password: 'ValidPassword123!',
        deviceId: '550e8400-e29b-41d4-a716-446655440046',
      },
      {
        deviceId: '550e8400-e29b-41d4-a716-446655440046',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent',
      },
    );

    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.login',
        actorUserId: 'user-1',
        targetType: 'user',
        targetId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent',
        metadata: {
          deviceId: '550e8400-e29b-41d4-a716-446655440046',
        },
      }),
    );
  });
});

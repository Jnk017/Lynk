jest.mock('uuid', () => ({
  v4: () => '00000000-0000-4000-8000-000000000044',
}));

import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
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

function user(): User {
  const entity = new User();
  entity.id = 'user-1';
  entity.email = 'user@example.com';
  entity.phone = null;
  entity.role = UserRole.USER;
  entity.isBanned = false;
  return entity;
}

function token(input: Partial<RefreshToken> = {}): RefreshToken {
  const entity = new RefreshToken();
  entity.id = 'old-token-id';
  entity.userId = 'user-1';
  entity.tokenHash = 'hash';
  entity.deviceId = 'device-1';
  entity.userAgent = 'jest-agent';
  entity.ipAddress = '127.0.0.1';
  entity.expiresAt = new Date(Date.now() + 60_000);
  entity.lastUsedAt = null;
  entity.revokedAt = null;
  entity.replacedByTokenId = null;
  entity.reuseDetectedAt = null;
  entity.metadata = {};
  return Object.assign(entity, input);
}

function serviceWith(tokenRecord: RefreshToken) {
  const userRepository = { findOne: jest.fn().mockResolvedValue(user()) };
  const refreshTokenRepository = {
    findOne: jest.fn().mockResolvedValue(tokenRecord),
    save: jest.fn((value: RefreshToken) => Promise.resolve(value)),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
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

describe('AuthService refresh token security', () => {
  it('rotates a valid refresh token and links the old token', async () => {
    const jwt = new JwtService();
    const refreshToken = jwt.sign(
      { sub: 'user-1', jti: 'old-token-id', deviceId: 'device-1' },
      { secret: refreshKey, expiresIn: '30d' },
    );
    const { auditLogService, authService, refreshTokenRepository } =
      serviceWith(token({ tokenHash: await bcrypt.hash(refreshToken, 12) }));

    await expect(authService.refreshTokens(refreshToken)).resolves.toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(refreshTokenRepository.update).toHaveBeenCalledWith('old-token-id', {
      replacedByTokenId: '00000000-0000-4000-8000-000000000044',
    });
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.refresh_token_rotation' }),
    );
  });

  it('detects revoked refresh token reuse and audits it', async () => {
    const jwt = new JwtService();
    const refreshToken = jwt.sign(
      { sub: 'user-1', jti: 'old-token-id', deviceId: 'device-1' },
      { secret: refreshKey, expiresIn: '30d' },
    );
    const { auditLogService, authService, refreshTokenRepository } =
      serviceWith(
        token({
          revokedAt: new Date(),
          tokenHash: await bcrypt.hash(refreshToken, 12),
        }),
      );

    await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      'old-token-id',
      expect.any(Object),
    );
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.refresh_token_reuse_detected',
        actorUserId: 'user-1',
        targetId: 'old-token-id',
      }),
    );
  });
});

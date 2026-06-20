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
import { Gender, UserRole, VerificationStatus } from '../../common/enums';

const accessSecret = 'test_access_secret_minimum_32_chars';
const refreshSecret = 'test_refresh_secret_minimum_32_chars';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    phone: null,
    passwordHash: null,
    piWalletAddress: null,
    piUid: null,
    piUsername: null,
    googleId: null,
    appleId: null,
    referralCode: 'ABC12345',
    referredById: null,
    referredBy: null,
    successfulReferralsCount: 0,
    isFounder: false,
    founderRank: null,
    role: UserRole.USER,
    isRevenueSharingActive: false,
    revenueSharingJoinedAt: null,
    displayName: 'Test User',
    bio: null,
    birthdate: null,
    gender: Gender.OTHER,
    lifestyleTags: [],
    location: null,
    verificationStatus: VerificationStatus.NONE,
    livenessVideoUrl: null,
    kycDocumentUrl: null,
    trustScore: 0,
    subscriptionPlanId: null,
    subscriptionPlan: null,
    subscriptionExpiresAt: null,
    piBalance: 0,
    fiatBalance: 0,
    isOnline: false,
    lastSeen: null,
    isProfileComplete: false,
    spotifyConnected: null,
    instagramConnected: null,
    blockContacts: false,
    isBanned: false,
    bannedAt: null,
    banReason: null,
    fcmToken: null,
    preferences: {},
    media: [],
    prompts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    deletionRequestedAt: null,
    ...overrides,
  } as User;
}

function makeRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    id: 'old-token-id',
    userId: 'user-1',
    user: makeUser(),
    tokenHash: 'hash',
    deviceId: 'device-1',
    userAgent: 'jest-agent',
    ipAddress: '127.0.0.1',
    expiresAt: new Date(Date.now() + 60_000),
    lastUsedAt: null,
    revokedAt: null,
    replacedByTokenId: null,
    reuseDetectedAt: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as RefreshToken;
}

function buildService(params: {
  tokenRecord?: RefreshToken | null;
  user?: User | null;
}) {
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(params.user ?? makeUser()),
  };
  const refreshTokenRepository = {
    findOne: jest.fn().mockResolvedValue(params.tokenRecord ?? null),
    save: jest.fn((input: Partial<RefreshToken>) => Promise.resolve(input)),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const auditLogService = { record: jest.fn() };

  const service = new AuthService(
    userRepository as unknown as Repository<User>,
    {} as Repository<ReferralLog>,
    refreshTokenRepository as unknown as Repository<RefreshToken>,
    new JwtService(),
    {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.accessSecret': accessSecret,
          'jwt.refreshSecret': refreshSecret,
          'jwt.refreshExpiresIn': '30d',
        };
        return values[key];
      }),
    } as unknown as ConfigService,
    {} as DataSource,
    {} as FounderService,
    auditLogService as unknown as AuditLogService,
  );

  return { auditLogService, refreshTokenRepository, service, userRepository };
}

describe('AuthService refresh token security', () => {
  it('rotates a valid refresh token and links the old token to the replacement', async () => {
    const jwt = new JwtService();
    const refreshToken = jwt.sign(
      { sub: 'user-1', jti: 'old-token-id', deviceId: 'device-1' },
      { secret: refreshSecret, expiresIn: '30d' },
    );
    const tokenRecord = makeRefreshToken({
      tokenHash: await bcrypt.hash(refreshToken, 12),
    });
    const { auditLogService, refreshTokenRepository, service } = buildService({
      tokenRecord,
    });

    const result = await service.refreshTokens(refreshToken, {
      ipAddress: '10.0.0.1',
      userAgent: 'new-agent',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(refreshTokenRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
    expect(refreshTokenRepository.update).toHaveBeenCalledWith('old-token-id', {
      replacedByTokenId: '00000000-0000-4000-8000-000000000044',
    });
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.refresh_token_rotation' }),
    );
  });

  it('revokes active sessions and audits refresh token reuse', async () => {
    const jwt = new JwtService();
    const refreshToken = jwt.sign(
      { sub: 'user-1', jti: 'old-token-id', deviceId: 'device-1' },
      { secret: refreshSecret, expiresIn: '30d' },
    );
    const tokenRecord = makeRefreshToken({
      revokedAt: new Date(),
      tokenHash: await bcrypt.hash(refreshToken, 12),
    });
    const { auditLogService, refreshTokenRepository, service } = buildService({
      tokenRecord,
    });

    await expect(
      service.refreshTokens(refreshToken, {
        deviceId: 'device-1',
        ipAddress: '10.0.0.2',
        userAgent: 'replay-agent',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      'old-token-id',
      expect.objectContaining({ reuseDetectedAt: expect.any(Date) }),
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

jest.mock('uuid', () => {
  let counter = 0;
  return {
    v4: () => {
      counter += 1;
      return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
    },
  };
});

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { FounderService } from '../founder/founder.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Gender, UserRole, VerificationStatus } from '../../common/enums';

interface RepositoryMock<T extends object> {
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  save: jest.Mock<Promise<T>, [Partial<T>]>;
  update: jest.Mock<Promise<UpdateResult>, [unknown, Partial<T>]>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function thisFindOptionsWhere(input: unknown): Partial<RefreshToken> {
  if (!isRecord(input) || !isRecord(input.where)) return {};
  return input.where;
}

describe('AuthService refresh token rotation', () => {
  const accessSecret = 'test_access_secret_minimum_32_chars';
  const refreshSecret = 'test_refresh_secret_minimum_32_chars';
  const deviceId = '550e8400-e29b-41d4-a716-446655440000';

  let user: User;
  let userRepository: RepositoryMock<User>;
  let refreshTokenRepository: RepositoryMock<RefreshToken>;
  let auditLogService: jest.Mocked<Pick<AuditLogService, 'record'>>;
  let tokenStore: Map<string, RefreshToken>;
  let service: AuthService;

  const updateResult: UpdateResult = {
    affected: 1,
    generatedMaps: [],
    raw: {},
  };

  beforeEach(async () => {
    tokenStore = new Map<string, RefreshToken>();
    user = {
      id: '9b0b329a-e3ff-46c8-ad77-946d1fdb47de',
      email: 'alex@example.com',
      phone: null,
      passwordHash: await bcrypt.hash('ValidPassword123!', 12),
      piWalletAddress: null,
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
      displayName: 'Alex',
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
    };

    userRepository = {
      findOne: jest.fn((input: unknown) => {
        void input;
        return Promise.resolve(user);
      }),
      save: jest.fn((input: Partial<User>) => Promise.resolve(input as User)),
      update: jest.fn((criteria: unknown, partial: Partial<User>) => {
        void criteria;
        void partial;
        return Promise.resolve(updateResult);
      }),
    };

    refreshTokenRepository = {
      findOne: jest.fn((input: unknown) => {
        const where = thisFindOptionsWhere(input);
        const id = where.id;
        return Promise.resolve(id ? tokenStore.get(id) || null : null);
      }),
      save: jest.fn((input: Partial<RefreshToken>) => {
        const token = {
          ...input,
          createdAt: input.createdAt || new Date(),
          updatedAt: input.updatedAt || new Date(),
          deletedAt: null,
        } as RefreshToken;
        tokenStore.set(token.id, token);
        return Promise.resolve(token);
      }),
      update: jest.fn((criteria: unknown, partial: Partial<RefreshToken>) => {
        if (typeof criteria === 'string') {
          const token = tokenStore.get(criteria);
          if (token) Object.assign(token, partial);
        } else if (isRecord(criteria)) {
          const id = criteria.id;
          const userId = criteria.userId;
          if (typeof id === 'string') {
            const token = tokenStore.get(id);
            if (token) Object.assign(token, partial);
          } else if (typeof userId === 'string') {
            for (const token of tokenStore.values()) {
              if (token.userId === userId) Object.assign(token, partial);
            }
          }
        }
        return Promise.resolve(updateResult);
      }),
    };

    auditLogService = { record: jest.fn() };

    service = new AuthService(
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
  });

  it('hashes refresh tokens during login and never stores the raw token', async () => {
    const result = await service.login(
      { email: user.email, password: 'ValidPassword123!', deviceId },
      { deviceId, userAgent: 'jest', ipAddress: '127.0.0.1' },
    );

    const storedToken = [...tokenStore.values()][0];
    expect(result.refreshToken).toBeDefined();
    expect(storedToken.tokenHash).not.toEqual(result.refreshToken);
    await expect(
      bcrypt.compare(result.refreshToken, storedToken.tokenHash),
    ).resolves.toBe(true);
    expect(storedToken.deviceId).toBe(deviceId);
    expect(storedToken.userAgent).toBe('jest');
    expect(storedToken.ipAddress).toBe('127.0.0.1');
  });

  it('rotates refresh tokens and rejects reuse of the revoked token', async () => {
    const loginResult = await service.login(
      { email: user.email, password: 'ValidPassword123!', deviceId },
      { deviceId },
    );
    const originalToken = [...tokenStore.values()][0];

    const rotated = await service.refreshTokens(loginResult.refreshToken, {
      deviceId,
    });
    const activeTokens = [...tokenStore.values()];

    expect(rotated.refreshToken).not.toEqual(loginResult.refreshToken);
    expect(originalToken.revokedAt).toBeInstanceOf(Date);
    expect(tokenStore.get(originalToken.id)?.replacedByTokenId).toBeDefined();
    expect(activeTokens).toHaveLength(2);

    await expect(
      service.refreshTokens(loginResult.refreshToken, { deviceId }),
    ).rejects.toThrow('Refresh token has been revoked');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.refresh_token_reuse_detected',
        actorUserId: user.id,
        targetType: 'refresh_token',
        targetId: originalToken.id,
      }),
    );
  });

  it('revokes the current refresh token on logout', async () => {
    const loginResult = await service.login(
      { email: user.email, password: 'ValidPassword123!', deviceId },
      { deviceId },
    );
    const storedToken = [...tokenStore.values()][0];

    await service.logout(loginResult.refreshToken);

    expect(storedToken.revokedAt).toBeInstanceOf(Date);
  });
});

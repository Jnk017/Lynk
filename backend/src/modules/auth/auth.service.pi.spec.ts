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

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { FounderService } from '../founder/founder.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LegalLanguage } from '../legal/dto/legal.dto';
import { Gender, UserRole, VerificationStatus } from '../../common/enums';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '9b0b329a-e3ff-46c8-ad77-946d1fdb47de',
    email: null,
    phone: null,
    passwordHash: null,
    piWalletAddress: null,
    piUid: 'pi-user-1',
    piUsername: 'pi_alex',
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
    displayName: 'Pi Alex',
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
  };
}

function buildService(user: User | null = null) {
  const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
  const refreshTokenRepository = {
    save: jest.fn((input: Partial<RefreshToken>) => Promise.resolve(input)),
  };
  const auditLogService = { record: jest.fn() };
  const founderService = { allocateFounderSlotWithManager: jest.fn() };
  const managerSave = jest.fn((target: unknown, value: unknown) => {
    if (target === User) {
      return Promise.resolve(makeUser(value as Partial<User>));
    }
    return Promise.resolve(value);
  });
  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: { save: managerSave },
  };

  const service = new AuthService(
    userRepository as unknown as Repository<User>,
    {} as Repository<ReferralLog>,
    refreshTokenRepository as unknown as Repository<RefreshToken>,
    new JwtService(),
    {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.accessSecret': 'test_access_secret_minimum_32_chars',
          'jwt.refreshSecret': 'test_refresh_secret_minimum_32_chars',
          'jwt.refreshExpiresIn': '30d',
        };
        return values[key];
      }),
    } as unknown as ConfigService,
    { createQueryRunner: () => queryRunner } as unknown as DataSource,
    founderService as unknown as FounderService,
    auditLogService as unknown as AuditLogService,
  );

  return {
    auditLogService,
    founderService,
    managerSave,
    queryRunner,
    refreshTokenRepository,
    service,
    userRepository,
  };
}

describe('AuthService Pi authentication', () => {
  it('rejects a client Pi UID that does not match the Pi API UID', async () => {
    const { service, userRepository } = buildService();

    await expect(
      service.loginWithPi({ uid: 'wrong-user', accessToken: 'token' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });

  it('logs in an existing Pi account by piUid and returns tokens', async () => {
    const { refreshTokenRepository, service, userRepository } =
      buildService(makeUser());

    const result = await service.loginWithPi({
      uid: 'pi-user-1',
      accessToken: 'token',
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { piUid: 'pi-user-1' },
    });
    expect(result.user).toMatchObject({ piUid: 'pi-user-1' });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('rejects new Pi accounts when legal acceptance is incomplete', async () => {
    const { service } = buildService();

    await expect(
      service.loginWithPi({ uid: 'pi-user-1', accessToken: 'token' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a new Pi account without copying piUid into piWalletAddress', async () => {
    const { founderService, managerSave, service } = buildService();

    const result = await service.loginWithPi({
      uid: 'pi-user-1',
      accessToken: 'token',
      username: 'pi_alex',
      termsAccepted: true,
      privacyAccepted: true,
      ageConfirmed: true,
      language: LegalLanguage.EN,
      documentVersion: '2.0',
    });

    expect(managerSave).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        piUid: 'pi-user-1',
        piUsername: 'pi_alex',
        piWalletAddress: undefined,
      }),
    );
    expect(result.user).toMatchObject({
      piUid: 'pi-user-1',
      piUsername: 'pi_alex',
      piWalletAddress: undefined,
    });
    expect(founderService.allocateFounderSlotWithManager).toHaveBeenCalled();
  });
});

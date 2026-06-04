import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, PiAuthDto } from './dto/login.dto';
import { JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from '../../common/constants';
import { ReferralStatus } from '../../common/enums';
import { FounderService } from '../founder/founder.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthSessionContext } from './types/auth-session-context';
import { ObservabilityService } from '../observability/observability.service';
import { ObservabilityEventName } from '../observability/observability-events';

interface JwtRefreshPayload {
  sub: string;
  jti: string;
  deviceId?: string;
}

interface PiMeResponse {
  uid: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ReferralLog)
    private referralLogRepository: Repository<ReferralLog>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
    private founderService: FounderService,
    private auditLogService: AuditLogService,
    @Optional()
    private observabilityService?: ObservabilityService,
  ) {}

  async register(dto: RegisterDto, context: AuthSessionContext = {}) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email or phone already exists',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const referralCode = this.generateReferralCode();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let referredBy: User | null = null;
      if (dto.referralCode) {
        referredBy = await queryRunner.manager.findOne(User, {
          where: { referralCode: dto.referralCode },
        });
      }

      const user = queryRunner.manager.create(User, {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        displayName: dto.displayName,
        gender: dto.gender,
        referralCode,
        referredById: referredBy?.id,
      });

      const savedUser = await queryRunner.manager.save(user);

      await this.founderService.allocateFounderSlotWithManager(
        queryRunner.manager,
        savedUser.id,
      );

      if (referredBy) {
        await queryRunner.manager.save(ReferralLog, {
          referrerId: referredBy.id,
          refereeId: savedUser.id,
          status: ReferralStatus.REGISTERED,
        });
      }

      await queryRunner.commitTransaction();

      const tokens = await this.generateTokens(savedUser, {
        ...context,
        deviceId: dto.deviceId || context.deviceId,
      });
      void this.observabilityService?.track(
        ObservabilityEventName.USER_REGISTERED,
        savedUser.id,
        { method: 'password', hasReferral: Boolean(referredBy) },
      );
      return {
        user: this.sanitizeUser(savedUser),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto, context: AuthSessionContext = {}) {
    const user = await this.userRepository.findOne({
      where: [
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('This account has been suspended');
    }

    const tokens = await this.generateTokens(user, {
      ...context,
      deviceId: dto.deviceId || context.deviceId,
    });
    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async loginWithPi(dto: PiAuthDto, context: AuthSessionContext = {}) {
    // Verify the Pi access token via Pi Network API
    const piUser = await this.verifyPiToken(dto.accessToken);

    let user = await this.userRepository.findOne({
      where: { piWalletAddress: piUser.uid },
    });

    if (!user) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        user = await queryRunner.manager.save(User, {
          piWalletAddress: piUser.uid,
          displayName: piUser.username,
          referralCode: this.generateReferralCode(),
        });

        await this.founderService.allocateFounderSlotWithManager(
          queryRunner.manager,
          user.id,
        );

        await queryRunner.commitTransaction();
        void this.observabilityService?.track(
          ObservabilityEventName.USER_REGISTERED,
          user.id,
          { method: 'pi' },
        );
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    const tokens = await this.generateTokens(user, {
      ...context,
      deviceId: dto.deviceId || context.deviceId,
    });
    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
    context: AuthSessionContext = {},
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { id: payload.jti, userId: payload.sub },
      });
      if (!tokenRecord) throw new UnauthorizedException('Invalid session');

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || user.isBanned) {
        throw new UnauthorizedException('Invalid session');
      }

      const tokenMatches = await bcrypt.compare(
        refreshToken,
        tokenRecord.tokenHash,
      );
      if (!tokenMatches) throw new UnauthorizedException('Invalid session');

      if (tokenRecord.revokedAt) {
        await this.handleRefreshTokenReuse(tokenRecord, context);
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (tokenRecord.expiresAt <= new Date()) {
        await this.refreshTokenRepository.update(tokenRecord.id, {
          revokedAt: new Date(),
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      tokenRecord.revokedAt = new Date();
      tokenRecord.lastUsedAt = new Date();
      await this.refreshTokenRepository.save(tokenRecord);

      const rotated = await this.generateTokens(user, {
        deviceId: context.deviceId || tokenRecord.deviceId || payload.deviceId,
        userAgent: context.userAgent || tokenRecord.userAgent,
        ipAddress: context.ipAddress || tokenRecord.ipAddress,
      });

      await this.refreshTokenRepository.update(tokenRecord.id, {
        replacedByTokenId: rotated.refreshTokenId,
      });

      return {
        accessToken: rotated.accessToken,
        refreshToken: rotated.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });
    await this.refreshTokenRepository.update(
      { id: payload.jti, userId: payload.sub },
      { revokedAt: new Date() },
    );
    return { success: true };
  }

  async logoutAllDevices(userId: string): Promise<{ success: true }> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { success: true };
  }

  async revokeDevice(
    userId: string,
    deviceId: string,
  ): Promise<{ success: true }> {
    await this.refreshTokenRepository.update(
      { userId, deviceId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { success: true };
  }

  private async generateTokens(
    user: User,
    context: AuthSessionContext = {},
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
  }> {
    const refreshTokenId = uuidv4();
    const basePayload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const refreshPayload = {
      ...basePayload,
      jti: refreshTokenId,
      deviceId: context.deviceId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(basePayload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: JWT_ACCESS_EXPIRY,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: JWT_REFRESH_EXPIRY,
      }),
    ]);

    await this.refreshTokenRepository.save({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      deviceId: context.deviceId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + this.getRefreshTokenTtlMs()),
    });

    return { accessToken, refreshToken, refreshTokenId };
  }

  private async handleRefreshTokenReuse(
    tokenRecord: RefreshToken,
    context: AuthSessionContext,
  ): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.update(tokenRecord.id, {
      reuseDetectedAt: now,
    });
    await this.refreshTokenRepository.update(
      { userId: tokenRecord.userId, revokedAt: IsNull() },
      { revokedAt: now },
    );
    await this.auditLogService.record({
      action: 'auth.refresh_token_reuse_detected',
      actorUserId: tokenRecord.userId,
      targetType: 'refresh_token',
      targetId: tokenRecord.id,
      metadata: {
        deviceId: context.deviceId || tokenRecord.deviceId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      },
    });
  }

  private getRefreshTokenTtlMs(): number {
    const configured =
      this.configService.get<string>('jwt.refreshExpiresIn') ||
      JWT_REFRESH_EXPIRY;
    const match = /^(\d+)([dhms])$/.exec(configured);
    if (!match) return 30 * 24 * 60 * 60 * 1000;

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      d: 24 * 60 * 60 * 1000,
      h: 60 * 60 * 1000,
      m: 60 * 1000,
      s: 1000,
    };
    return value * multipliers[unit];
  }

  private async verifyPiToken(
    accessToken: string,
  ): Promise<{ uid: string; username: string }> {
    const axios = await import('axios');
    const response = await axios.default.get<PiMeResponse>(
      'https://api.minepi.com/v2/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  }

  private generateReferralCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      piWalletAddress: user.piWalletAddress,
      displayName: user.displayName,
      gender: user.gender,
      referralCode: user.referralCode,
      isFounder: user.isFounder,
      founderRank: user.founderRank,
      isRevenueSharingActive: user.isRevenueSharingActive,
      role: user.role,
      verificationStatus: user.verificationStatus,
      trustScore: user.trustScore,
      subscriptionPlanId: user.subscriptionPlanId,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

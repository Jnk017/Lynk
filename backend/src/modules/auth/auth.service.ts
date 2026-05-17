import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from '../referral/entities/referral-log.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, PiAuthDto } from './dto/login.dto';
import { JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, MAX_FOUNDERS } from '../../common/constants';
import { ReferralStatus } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ReferralLog)
    private referralLogRepository: Repository<ReferralLog>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
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
      throw new ConflictException('An account with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const referralCode = this.generateReferralCode();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const totalUsers = await queryRunner.manager.count(User);

      // Assign Founder status to the first 2500 users.
      const isFounder = totalUsers < MAX_FOUNDERS;
      const founderRank = isFounder ? totalUsers + 1 : undefined;

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
        isFounder,
        founderRank,
      });

      const savedUser = await queryRunner.manager.save(user);

      if (referredBy) {
        await queryRunner.manager.save(ReferralLog, {
          referrerId: referredBy.id,
          refereeId: savedUser.id,
          status: ReferralStatus.REGISTERED,
        });
      }

      await queryRunner.commitTransaction();

      const tokens = await this.generateTokens(savedUser);
      return { user: this.sanitizeUser(savedUser), ...tokens };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('This account has been suspended');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async loginWithPi(dto: PiAuthDto) {
    // Verify the Pi access token via Pi Network API
    const piUser = await this.verifyPiToken(dto.accessToken);

    let user = await this.userRepository.findOne({
      where: { piWalletAddress: piUser.uid },
    });

    if (!user) {
      const referralCode = this.generateReferralCode();
      const totalUsers = await this.userRepository.count();
      const isFounder = totalUsers < MAX_FOUNDERS;
      const founderRank = isFounder ? totalUsers + 1 : undefined;

      user = await this.userRepository.save({
        piWalletAddress: piUser.uid,
        displayName: piUser.username,
        referralCode,
        isFounder,
        founderRank,
      });
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || user.isBanned) {
        throw new UnauthorizedException('Invalid session');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: JWT_ACCESS_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: JWT_REFRESH_EXPIRY,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyPiToken(accessToken: string): Promise<{ uid: string; username: string }> {
    const axios = await import('axios');
    const response = await axios.default.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  private generateReferralCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user as User & { passwordHash?: string };
    return sanitized;
  }
}

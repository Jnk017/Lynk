import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AppChannel } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { PiLoginDto } from '../dto/pi-login.dto';
import { PiApiService } from './pi-api.service';

@Injectable()
export class PiAuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private piApi: PiApiService,
    private jwt: JwtService,
  ) {}
  async login(dto: PiLoginDto, channel: AppChannel) {
    if (
      channel !== AppChannel.PI_ECOSYSTEM &&
      process.env.GLOBAL_PI_AUTH_ENABLED !== 'true'
    )
      throw new UnauthorizedException(
        'Pi authentication is not enabled for this source',
      );
    const me = await this.piApi.verifyAccessTokenWithMe(dto.accessToken);
    if (me.uid !== dto.uid) throw new BadRequestException('Pi uid mismatch');
    const existing = await this.users.findOne({ where: { piUid: dto.uid } });
    let user = existing;
    if (!user) {
      const byWallet = await this.users.findOne({
        where: { piWalletAddress: dto.uid },
      });
      if (byWallet && byWallet.piUid && byWallet.piUid !== dto.uid)
        throw new ConflictException('Pi account already linked');
      user = await this.users.save(
        this.users.create({
          piUid: dto.uid,
          piUsername: dto.username || me.username,
          piWalletAddress: dto.uid,
          displayName: dto.username || me.username || 'Lynk member',
          referralCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
          registrationChannel: channel,
          lastChannelUsed: channel,
        }),
      );
    } else {
      user.piUsername = dto.username || me.username || user.piUsername;
      user.lastChannelUsed = channel;
      await this.users.save(user);
    }
    return {
      user: this.sanitize(user),
      accessToken: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }
  private sanitize(user: User) {
    const safe = { ...(user as User & { passwordHash?: string }) };
    delete safe.passwordHash;
    return safe;
  }
}

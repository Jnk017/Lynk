import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Param,
  Request,
  Headers,
  Ip,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  LoginDto,
  LogoutDto,
  PiAuthDto,
  RefreshTokenDto,
} from './dto/login.dto';
import { AuthSessionContext } from './types/auth-session-context';
import { CurrentChannel } from '../../common/decorators/current-channel.decorator';
import { AppChannel } from '../../common/enums';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register with email/phone and password' })
  register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @CurrentChannel() channel: AppChannel,
  ) {
    if (channel === AppChannel.PI_ECOSYSTEM) {
      throw new BadRequestException(
        'Only Pi authentication is allowed for this source',
      );
    }
    return this.authService.register(
      dto,
      this.getSessionContext(dto.deviceId, userAgent, ipAddress),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email/phone and password' })
  login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @CurrentChannel() channel: AppChannel,
  ) {
    if (channel === AppChannel.PI_ECOSYSTEM) {
      throw new BadRequestException(
        'Only Pi authentication is allowed for this source',
      );
    }
    return this.authService.login(
      dto,
      this.getSessionContext(dto.deviceId, userAgent, ipAddress),
    );
  }

  @Post('pi')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate with Pi Network' })
  loginWithPi(
    @Body() dto: PiAuthDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @CurrentChannel() channel: AppChannel,
  ) {
    if (channel !== AppChannel.PI_ECOSYSTEM) {
      throw new ForbiddenException(
        'Pi authentication requires PI_ECOSYSTEM channel',
      );
    }
    return this.authService.loginWithPi(
      dto,
      this.getSessionContext(dto.deviceId, userAgent, ipAddress),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.refreshTokens(
      dto.refreshToken,
      this.getSessionContext(undefined, userAgent, ipAddress),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Logout current device by revoking refresh token' })
  logout(
    @Body() dto: LogoutDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.logout(dto.refreshToken, { userAgent, ipAddress });
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all devices for the current user' })
  logoutAll(
    @Request() req: { user: { id: string } },
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.logoutAllDevices(req.user.id, {
      userAgent,
      ipAddress,
    });
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active refresh-token sessions' })
  sessions(@Request() req: { user: { id: string } }) {
    return this.authService.listSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke one refresh-token session' })
  revokeSession(
    @Request() req: { user: { id: string } },
    @Param('id') sessionId: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.revokeSession(req.user.id, sessionId, {
      userAgent,
      ipAddress,
    });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Request() req: { user: Record<string, unknown> }) {
    return req.user;
  }

  private getSessionContext(
    deviceId: string | undefined,
    userAgent: string | undefined,
    ipAddress: string | undefined,
  ): AuthSessionContext {
    return { deviceId, userAgent, ipAddress };
  }
}

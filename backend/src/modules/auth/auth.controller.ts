import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Headers,
  Ip,
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
  ) {
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
  ) {
    return this.authService.login(
      dto,
      this.getSessionContext(dto.deviceId, userAgent, ipAddress),
    );
  }

  @Post('pi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Pi Network wallet' })
  loginWithPi(
    @Body() dto: PiAuthDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.loginWithPi(
      dto,
      this.getSessionContext(dto.deviceId, userAgent, ipAddress),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
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
  @ApiOperation({ summary: 'Logout current device by revoking refresh token' })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all devices for the current user' })
  logoutAll(@Request() req: { user: { id: string } }) {
    return this.authService.logoutAllDevices(req.user.id);
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

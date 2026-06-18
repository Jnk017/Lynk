import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentChannel } from '../../../common/decorators/current-channel.decorator';
import { AppChannel } from '../../../common/enums';
import { PiLoginDto } from '../dto/pi-login.dto';
import { PiAuthService } from '../services/pi-auth.service';
@Controller('auth/pi')
export class PiAuthController {
  constructor(private readonly auth: PiAuthService) {}
  @Post('login') @HttpCode(HttpStatus.OK) login(
    @Body() dto: PiLoginDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.auth.login(dto, channel);
  }
}

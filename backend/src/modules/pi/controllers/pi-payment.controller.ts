import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentChannel } from '../../../common/decorators/current-channel.decorator';
import { AppChannel } from '../../../common/enums';
import {
  PiApprovePaymentDto,
  PiCancelPaymentDto,
  PiCompletePaymentDto,
  PiErrorPaymentDto,
  PiIncompletePaymentDto,
} from '../dto/pi-payment.dto';
import { PiIncompletePaymentService } from '../services/pi-incomplete-payment.service';
import { PiPaymentService } from '../services/pi-payment.service';
@Controller('payments/pi')
@UseGuards(AuthGuard('jwt'))
export class PiPaymentController {
  constructor(
    private readonly payments: PiPaymentService,
    private readonly incomplete: PiIncompletePaymentService,
  ) {}
  @Post('approve') approve(
    @Request() req: { user: { id: string } },
    @Body() dto: PiApprovePaymentDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.payments.approve(req.user.id, dto, channel);
  }
  @Post('complete') complete(
    @Request() req: { user: { id: string } },
    @Body() dto: PiCompletePaymentDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.payments.complete(req.user.id, dto, channel);
  }
  @Post('cancel') cancel(
    @Request() req: { user: { id: string } },
    @Body() dto: PiCancelPaymentDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.payments.cancel(req.user.id, dto, channel);
  }
  @Post('error') error(
    @Request() req: { user: { id: string } },
    @Body() dto: PiErrorPaymentDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.payments.error(req.user.id, dto, channel);
  }
  @Post('incomplete') recover(
    @Request() req: { user: { id: string } },
    @Body() dto: PiIncompletePaymentDto,
    @CurrentChannel() channel: AppChannel,
  ) {
    return this.incomplete.recover(req.user.id, dto.payment, channel);
  }
}

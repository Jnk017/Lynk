import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { TransactionType } from '../../common/enums';

class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents (USD)' })
  @IsNumber()
  @Min(100)
  amountCents: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}

class CreditPiDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  piAmount: number;

  @ApiProperty()
  @IsString()
  piTxId: string;
}

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('stripe/intent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createIntent(@Request() req: { user: { id: string } }, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentService.createStripePaymentIntent(req.user.id, dto.amountCents, 'usd', dto.type);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentService.handleStripeWebhook(req.rawBody as Buffer, sig);
  }

  @Post('pi/credit')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Credit Pi balance after Pi Network payment' })
  creditPi(@Request() req: { user: { id: string } }, @Body() dto: CreditPiDto) {
    return this.paymentService.creditPiPayment(req.user.id, dto.piAmount, dto.piTxId);
  }

  @Get('transactions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transaction history' })
  getTransactions(
    @Request() req: { user: { id: string } },
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.paymentService.getUserTransactions(req.user.id, Number(page), Number(limit));
  }
}

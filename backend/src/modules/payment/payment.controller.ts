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
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentService } from './payment.service';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionType,
} from '../../common/enums';

class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents (USD)' })
  @IsNumber()
  @Min(100)
  amountCents: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}

class CreateProviderPaymentDto {
  @ApiProperty({ description: 'Amount in major currency units' })
  @IsNumber()
  @Min(0.000001)
  amount: number;

  @ApiProperty({ enum: TransactionCurrency })
  @IsEnum(TransactionCurrency)
  currency: TransactionCurrency;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}

class VerifyPiPaymentDto {
  @ApiProperty({
    description: 'Pi Network payment identifier returned by Pi SDK',
  })
  @IsString()
  piPaymentId: string;

  @ApiProperty({ enum: TransactionType, required: false })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('stripe/intent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create optional Stripe payment intent' })
  createIntent(
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createStripePaymentIntent(
      req.user.id,
      dto.amountCents,
      'usd',
      dto.type,
    );
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentService.handleStripeWebhook(req.rawBody, sig);
  }

  @Post('pi/verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Pi payment server-side and credit balance' })
  verifyPiPayment(
    @Request() req: { user: { id: string } },
    @Body() dto: VerifyPiPaymentDto,
  ) {
    return this.paymentService.verifyAndCreditPiPayment(
      req.user.id,
      dto.piPaymentId,
      dto.type || TransactionType.SUBSCRIPTION,
    );
  }

  @Post('providers/:provider/create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment through a provider abstraction' })
  createProviderPayment(
    @Request() req: { user: { id: string } },
    @Param('provider', new ParseEnumPipe(TransactionProvider))
    provider: TransactionProvider,
    @Body() dto: CreateProviderPaymentDto,
  ) {
    return this.paymentService.createProviderPayment(
      req.user.id,
      provider,
      dto.amount,
      dto.currency,
      dto.type,
    );
  }

  @Post('providers/:provider/webhook')
  @ApiOperation({ summary: 'Generic provider webhook endpoint' })
  providerWebhook(
    @Param('provider', new ParseEnumPipe(TransactionProvider))
    provider: TransactionProvider,
    @Body() payload: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    return this.paymentService.handleProviderWebhook(
      provider,
      payload,
      headers,
    );
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
    return this.paymentService.getUserTransactions(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }
}

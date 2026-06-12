import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  Request,
  Query,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaymentService } from './payment.service';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionType,
} from '../../common/enums';

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

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('providers/:provider/create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment through Pawapay or Binance Pay' })
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
  @ApiOperation({ summary: 'Pawapay or Binance Pay webhook endpoint' })
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

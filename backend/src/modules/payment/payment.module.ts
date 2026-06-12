import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { User } from '../user/entities/user.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PawapayPaymentProviderStub } from './providers/pawapay-payment-provider.stub';
import { BinancePayPaymentProviderStub } from './providers/binance-pay-payment-provider.stub';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, PaymentWebhookLog, User])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PawapayPaymentProviderStub,
    BinancePayPaymentProviderStub,
  ],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}

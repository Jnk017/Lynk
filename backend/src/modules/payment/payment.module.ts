import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { User } from '../user/entities/user.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PiPaymentProvider } from './providers/pi-payment.provider';
import { MonerooPaymentProviderStub } from './providers/moneroo-payment-provider.stub';
import { AvadaPayPaymentProviderStub } from './providers/avadapay-payment-provider.stub';
import { CoinbaseCommerceProviderStub } from './providers/coinbase-commerce-provider.stub';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, PaymentWebhookLog, User])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PiPaymentProvider,
    MonerooPaymentProviderStub,
    AvadaPayPaymentProviderStub,
    CoinbaseCommerceProviderStub,
  ],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}

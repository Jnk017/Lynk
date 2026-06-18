import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { User } from '../user/entities/user.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PiPaymentProvider } from './providers/pi-payment.provider';
import { PawapayPaymentProviderStub } from './providers/pawapay-payment-provider.stub';
import { BinancePayPaymentProviderStub } from './providers/binance-pay-payment-provider.stub';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PaymentWebhookLog, User]),
    AuditLogModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PiPaymentProvider,
    PawapayPaymentProviderStub,
    BinancePayPaymentProviderStub,
  ],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}

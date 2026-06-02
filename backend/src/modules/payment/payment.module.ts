import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { User } from '../user/entities/user.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PiPaymentProvider } from './providers/pi-payment.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, PaymentWebhookLog, User])],
  controllers: [PaymentController],
  providers: [PaymentService, PiPaymentProvider],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    PaymentModule,
    TypeOrmModule.forFeature([SubscriptionPlan, User, Transaction]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

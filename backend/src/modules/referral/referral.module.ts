import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { ReferralLog } from './entities/referral-log.entity';
import { RevenuePool } from './entities/revenue-pool.entity';
import { RevenueDistribution } from './entities/revenue-distribution.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralLog, RevenuePool, RevenueDistribution, User, Transaction]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}

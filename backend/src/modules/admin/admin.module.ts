import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { Founder } from '../founder/entities/founder.entity';
import { RevenueDistribution } from '../referral/entities/revenue-distribution.entity';
import { Report } from '../moderation/entities/report.entity';
import { ReferralModule } from '../referral/referral.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ReferralModule,
    AuditLogModule,
    SystemSettingsModule,
    FeatureFlagModule,
    UserModule,
    TypeOrmModule.forFeature([
      User,
      Transaction,
      Founder,
      RevenueDistribution,
      Report,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

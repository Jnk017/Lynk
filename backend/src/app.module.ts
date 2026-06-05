import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import configuration from './config/configuration';

// Entities
import { User } from './modules/user/entities/user.entity';
import { SubscriptionPlan } from './modules/subscription/entities/subscription-plan.entity';
import { ProfileMedia } from './modules/profile/entities/profile-media.entity';
import { UserPrompt } from './modules/profile/entities/user-prompt.entity';
import { SwipeActionEntity } from './modules/matchmaking/entities/swipe-action.entity';
import { Match } from './modules/matchmaking/entities/match.entity';
import { MatchmakingSession } from './modules/matchmaking/entities/matchmaking-session.entity';
import { ChatRoom } from './modules/chat/entities/chat-room.entity';
import { ChatParticipant } from './modules/chat/entities/chat-participant.entity';
import { Message } from './modules/chat/entities/message.entity';
import { Transaction } from './modules/payment/entities/transaction.entity';
import { GiftCatalogItem, GiftSent } from './modules/gift/entities/gift.entity';
import { StakingContract } from './modules/staking/entities/staking-contract.entity';
import { MarriageStake } from './modules/marriage/entities/marriage-stake.entity';
import { ReferralLog } from './modules/referral/entities/referral-log.entity';
import { RevenuePool } from './modules/referral/entities/revenue-pool.entity';
import { RevenueDistribution } from './modules/referral/entities/revenue-distribution.entity';
import { PaymentWebhookLog } from './modules/payment/entities/payment-webhook-log.entity';
import { Founder } from './modules/founder/entities/founder.entity';
import { SystemSetting } from './modules/system-settings/entities/system-setting.entity';
import { FeatureFlag } from './modules/feature-flag/entities/feature-flag.entity';
import { AuditLog } from './modules/audit-log/entities/audit-log.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { Report } from './modules/moderation/entities/report.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { VerificationModule } from './modules/verification/verification.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ReferralModule } from './modules/referral/referral.module';
import { StakingModule } from './modules/staking/staking.module';
import { MarriageModule } from './modules/marriage/marriage.module';
import { GiftModule } from './modules/gift/gift.module';
import { AiModule } from './modules/ai/ai.module';
import { S3Module } from './modules/s3/s3.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FounderModule } from './modules/founder/founder.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AdminModule } from './modules/admin/admin.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { ModerationModule } from './modules/moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          User,
          SubscriptionPlan,
          ProfileMedia,
          UserPrompt,
          SwipeActionEntity,
          Match,
          MatchmakingSession,
          ChatRoom,
          ChatParticipant,
          Message,
          Transaction,
          GiftCatalogItem,
          GiftSent,
          StakingContract,
          MarriageStake,
          ReferralLog,
          RevenuePool,
          RevenueDistribution,
          PaymentWebhookLog,
          Founder,
          SystemSetting,
          FeatureFlag,
          AuditLog,
          RefreshToken,
          Report,
        ],
        synchronize:
          configService.get<boolean>('database.synchronize') === true,
        logging: configService.get<boolean>('database.logging') === true,
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    ScheduleModule.forRoot(),

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): RedisModuleOptions => {
        const host = configService.get<string>('redis.host') || 'localhost';
        const port = configService.get<number>('redis.port') || 6379;
        const password = configService.get<string>('redis.password');
        return {
          type: 'single',
          options: password ? { host, port, password } : { host, port },
        };
      },
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    ProfileModule,
    VerificationModule,
    MatchmakingModule,
    ChatModule,
    PaymentModule,
    SubscriptionModule,
    ReferralModule,
    StakingModule,
    MarriageModule,
    GiftModule,
    AiModule,
    S3Module,
    NotificationModule,
    FounderModule,
    SystemSettingsModule,
    FeatureFlagModule,
    AuditLogModule,
    AdminModule,
    ObservabilityModule,
    ModerationModule,
  ],
})
export class AppModule {}

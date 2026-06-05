import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { Match } from '../matchmaking/entities/match.entity';
import { User } from '../user/entities/user.entity';
import { Report } from './entities/report.entity';
import { UserBlock } from './entities/user-block.entity';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, UserBlock, User, Match]),
    AuditLogModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService, TypeOrmModule],
})
export class ModerationModule {}

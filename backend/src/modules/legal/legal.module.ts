import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { User } from '../user/entities/user.entity';
import { LegalAcceptance } from './entities/legal-acceptance.entity';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';

@Module({
  imports: [TypeOrmModule.forFeature([LegalAcceptance, User]), AuditLogModule],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService, TypeOrmModule],
})
export class LegalModule {}

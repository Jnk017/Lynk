import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Founder } from './entities/founder.entity';
import { FounderService } from './founder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Founder, User])],
  providers: [FounderService],
  exports: [FounderService, TypeOrmModule],
})
export class FounderModule {}

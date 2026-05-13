import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarriageStake } from './entities/marriage-stake.entity';
import { User } from '../user/entities/user.entity';
import { MarriageService } from './marriage.service';
import { MarriageController } from './marriage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MarriageStake, User])],
  controllers: [MarriageController],
  providers: [MarriageService],
  exports: [MarriageService],
})
export class MarriageModule {}

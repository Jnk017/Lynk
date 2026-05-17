import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StakingContract } from './entities/staking-contract.entity';
import { User } from '../user/entities/user.entity';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StakingContract, User])],
  controllers: [StakingController],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}

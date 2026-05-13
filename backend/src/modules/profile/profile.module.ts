import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileMedia } from './entities/profile-media.entity';
import { UserPrompt } from './entities/user-prompt.entity';
import { S3Module } from '../s3/s3.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileMedia, UserPrompt]), S3Module, AiModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

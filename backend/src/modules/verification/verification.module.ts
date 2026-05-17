import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [UserModule, S3Module, ReferralModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}

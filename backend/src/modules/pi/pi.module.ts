import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { PiAuthController } from './controllers/pi-auth.controller';
import { PiPaymentController } from './controllers/pi-payment.controller';
import { PiPayment } from './entities/pi-payment.entity';
import { PiApiService } from './services/pi-api.service';
import { PiAuthService } from './services/pi-auth.service';
import { PiIncompletePaymentService } from './services/pi-incomplete-payment.service';
import { PiPaymentService } from './services/pi-payment.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([PiPayment, User]),
    JwtModule.register({}),
  ],
  controllers: [PiAuthController, PiPaymentController],
  providers: [
    PiApiService,
    PiAuthService,
    PiPaymentService,
    PiIncompletePaymentService,
  ],
  exports: [PiApiService],
})
export class PiModule {}

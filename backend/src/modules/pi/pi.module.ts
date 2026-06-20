import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { PiPaymentController } from './controllers/pi-payment.controller';
import { PiPayment } from './entities/pi-payment.entity';
import { PiApiService } from './services/pi-api.service';
import { PiIncompletePaymentService } from './services/pi-incomplete-payment.service';
import { PiPaymentService } from './services/pi-payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([PiPayment, User])],
  controllers: [PiPaymentController],
  providers: [PiApiService, PiPaymentService, PiIncompletePaymentService],
  exports: [PiApiService],
})
export class PiModule {}

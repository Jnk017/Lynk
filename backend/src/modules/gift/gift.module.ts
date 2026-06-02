import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCatalogItem, GiftSent } from './entities/gift.entity';
import { User } from '../user/entities/user.entity';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCatalogItem, GiftSent, User]),
    NotificationModule,
  ],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GiftCatalogItem, GiftSent } from './entities/gift.entity';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { TransactionCurrency, NotificationType } from '../../common/enums';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(GiftCatalogItem)
    private catalogRepository: Repository<GiftCatalogItem>,
    @InjectRepository(GiftSent)
    private giftSentRepository: Repository<GiftSent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
    private dataSource: DataSource,
  ) {}

  async getCatalog(): Promise<GiftCatalogItem[]> {
    return this.catalogRepository.find({ where: { isActive: true } });
  }

  async sendGift(
    senderId: string,
    receiverId: string,
    giftCatalogId: string,
    currency: TransactionCurrency,
    message?: string,
  ): Promise<GiftSent> {
    const [sender, receiver, gift] = await Promise.all([
      this.userRepository.findOne({ where: { id: senderId } }),
      this.userRepository.findOne({ where: { id: receiverId } }),
      this.catalogRepository.findOne({
        where: { id: giftCatalogId, isActive: true },
      }),
    ]);

    if (!sender || !receiver) throw new NotFoundException('User not found');
    if (!gift) throw new NotFoundException('Gift not found in catalog');

    const price =
      currency === TransactionCurrency.PI ? gift.pricePi : gift.priceUsd;
    const balanceField =
      currency === TransactionCurrency.PI ? 'piBalance' : 'fiatBalance';

    if (Number(sender[balanceField]) < price) {
      throw new BadRequestException('Insufficient balance');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Deduct from sender
      await queryRunner.manager.decrement(
        User,
        { id: senderId },
        balanceField,
        price,
      );

      // Apply trust score bonus to receiver (premium gifts boost Trust Score)
      if (gift.trustScoreBonus > 0) {
        await queryRunner.manager.increment(
          User,
          { id: receiverId },
          'trustScore',
          gift.trustScoreBonus,
        );
      }

      const sent = await queryRunner.manager.save(GiftSent, {
        senderId,
        receiverId,
        giftCatalogId,
        paidCurrency: currency,
        paidAmount: price,
        message,
      });

      await queryRunner.commitTransaction();

      // Send priority push notification for gift
      await this.notificationService.sendToUser(receiverId, {
        type: NotificationType.GIFT,
        title: `${sender.displayName} sent you a ${gift.name} ${gift.emoji}`,
        body: message || `You received a virtual gift!`,
        data: {
          giftId: sent.id,
          giftName: gift.name,
          senderId,
          isFullScreen: String(gift.isFullScreen),
        },
      });

      return sent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async seedGiftCatalog(): Promise<void> {
    const gifts = [
      {
        name: 'Rose',
        emoji: '🌹',
        pricePi: 0.1,
        priceUsd: 0.5,
        isFullScreen: false,
        trustScoreBonus: 1,
      },
      {
        name: 'Bouquet',
        emoji: '💐',
        pricePi: 0.5,
        priceUsd: 2,
        isFullScreen: false,
        trustScoreBonus: 2,
      },
      {
        name: 'Diamond Ring',
        emoji: '💍',
        pricePi: 5,
        priceUsd: 20,
        isFullScreen: true,
        trustScoreBonus: 5,
      },
      {
        name: 'Lion',
        emoji: '🦁',
        pricePi: 10,
        priceUsd: 50,
        isFullScreen: true,
        trustScoreBonus: 10,
      },
      {
        name: 'Crown',
        emoji: '👑',
        pricePi: 20,
        priceUsd: 99,
        isFullScreen: true,
        trustScoreBonus: 15,
      },
      {
        name: 'Yacht',
        emoji: '🛥️',
        pricePi: 50,
        priceUsd: 199,
        isFullScreen: true,
        trustScoreBonus: 20,
      },
    ];

    for (const gift of gifts) {
      const exists = await this.catalogRepository.findOne({
        where: { name: gift.name },
      });
      if (!exists) {
        await this.catalogRepository.save(gift);
      }
    }
  }
}

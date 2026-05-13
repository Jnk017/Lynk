import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import {
  SubscriptionTier,
  TransactionType,
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
} from '../../common/enums';
import { SUBSCRIPTION_PRICES } from '../../common/constants';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find();
  }

  async getPlanByTier(tier: SubscriptionTier): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { name: tier } });
    if (!plan) throw new NotFoundException(`Plan ${tier} not found`);
    return plan;
  }

  async subscribeToPlan(
    userId: string,
    tier: SubscriptionTier,
    currency: TransactionCurrency,
    provider: TransactionProvider,
    externalRef: string,
  ): Promise<User> {
    const plan = await this.getPlanByTier(tier);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Record the subscription transaction
      await queryRunner.manager.save(Transaction, {
        userId,
        type: TransactionType.SUBSCRIPTION,
        currency,
        amount: SUBSCRIPTION_PRICES[tier],
        provider,
        status: TransactionStatus.COMPLETED,
        externalRef,
        metadata: { tier },
      });

      // Update user's subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await queryRunner.manager.update(User, { id: userId }, {
        subscriptionPlanId: plan.id,
        subscriptionExpiresAt: expiresAt,
      });

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['subscriptionPlan'],
      });

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async seedDefaultPlans(): Promise<void> {
    const plans: Partial<SubscriptionPlan>[] = [
      {
        name: SubscriptionTier.BRONZE,
        displayName: 'Bronze',
        priceMonthly: 0,
        pricePi: 0,
        tierColor: '#CD7F32',
        dailySwipeLimit: 10,
        dailySuperLikes: 0,
        features: ['10 swipes/day', 'Basic verification', 'Standard matching'],
        hasSmartMatchmaking: false,
        hasMarriageStaking: false,
        canSeeWhoLiked: false,
        noAds: false,
        priorityLikes: false,
        hasConciergerie: false,
      },
      {
        name: SubscriptionTier.SILVER,
        displayName: 'Silver',
        priceMonthly: 4.99,
        pricePi: 10,
        tierColor: '#C0C0C0',
        dailySwipeLimit: null,
        dailySuperLikes: 5,
        features: ['Unlimited local swipes', '5 Super Likes/day', 'See who liked you'],
        hasSmartMatchmaking: false,
        hasMarriageStaking: false,
        canSeeWhoLiked: true,
        noAds: false,
        priorityLikes: false,
        hasConciergerie: false,
      },
      {
        name: SubscriptionTier.GOLD,
        displayName: 'Gold',
        priceMonthly: 14.99,
        pricePi: 30,
        tierColor: '#FFD700',
        dailySwipeLimit: null,
        dailySuperLikes: 10,
        features: ['Gold badge', 'Marriage Staking', 'Zero ads', 'Priority likes'],
        hasSmartMatchmaking: false,
        hasMarriageStaking: true,
        canSeeWhoLiked: true,
        noAds: true,
        priorityLikes: true,
        hasConciergerie: false,
      },
      {
        name: SubscriptionTier.PLATINUM,
        displayName: 'Global Elite',
        priceMonthly: 49.99,
        pricePi: 100,
        tierColor: '#E5E4E2',
        dailySwipeLimit: null,
        dailySuperLikes: 20,
        features: [
          'Global Elite badge',
          'AI Matchmaker (quarterly)',
          'Priority messaging',
          '24/7 Conciergerie',
          'Marriage Staking',
          'Zero ads',
        ],
        hasSmartMatchmaking: true,
        hasMarriageStaking: true,
        canSeeWhoLiked: true,
        noAds: true,
        priorityLikes: true,
        hasConciergerie: true,
      },
    ];

    for (const plan of plans) {
      const exists = await this.planRepository.findOne({ where: { name: plan.name } });
      if (!exists) {
        await this.planRepository.save(plan);
      }
    }
  }
}

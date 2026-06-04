import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MarriageStake } from './entities/marriage-stake.entity';
import { User } from '../user/entities/user.entity';
import { MarriageStakeStatus } from '../../common/enums';

const LOYALTY_BONUS_PERCENTAGE = 0.1; // 10% bonus on release

@Injectable()
export class MarriageService {
  constructor(
    @InjectRepository(MarriageStake)
    private marriageRepository: Repository<MarriageStake>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Initiate a marriage stake between two matched users.
   * Both must have Gold or Platinum subscription with hasMarriageStaking = true.
   */
  async initiateStake(
    user1Id: string,
    user2Id: string,
    amountPi: number,
  ): Promise<MarriageStake> {
    if (user1Id === user2Id) {
      throw new BadRequestException(
        'Cannot create a marriage stake with yourself',
      );
    }
    this.assertValidAmount(amountPi);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user1 = await queryRunner.manager.findOne(User, {
        where: { id: user1Id },
        relations: ['subscriptionPlan'],
        lock: { mode: 'pessimistic_write' },
      });
      const user2 = await queryRunner.manager.findOne(User, {
        where: { id: user2Id },
        relations: ['subscriptionPlan'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!user1 || !user2) throw new NotFoundException('User not found');

      if (
        !user1.subscriptionPlan?.hasMarriageStaking ||
        !user2.subscriptionPlan?.hasMarriageStaking
      ) {
        throw new ForbiddenException(
          'Marriage Staking requires Gold or Platinum subscription for both users',
        );
      }

      const perUserStake = amountPi / 2;
      if (
        Number(user1.piBalance) < perUserStake ||
        Number(user2.piBalance) < perUserStake
      ) {
        throw new BadRequestException('Insufficient Pi balance');
      }

      await queryRunner.manager.decrement(
        User,
        { id: user1Id },
        'piBalance',
        perUserStake,
      );
      await queryRunner.manager.decrement(
        User,
        { id: user2Id },
        'piBalance',
        perUserStake,
      );

      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      const stake = await queryRunner.manager.save(MarriageStake, {
        user1Id,
        user2Id,
        amountPi,
        status: MarriageStakeStatus.ACTIVE,
        verificationCode,
      });

      await queryRunner.commitTransaction();
      return stake;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Submit marriage proof (certificate URL + photo with embedded verification code).
   * Triggers manual review before release.
   */
  async submitProof(
    userId: string,
    stakeId: string,
    marriageProofUrl: string,
    marriagePhotoUrl: string,
  ): Promise<MarriageStake> {
    const stake = await this.marriageRepository.findOne({
      where: { id: stakeId },
    });
    if (!stake) throw new NotFoundException('Marriage stake not found');

    if (stake.user1Id !== userId && stake.user2Id !== userId) {
      throw new ForbiddenException('Not a party to this stake');
    }

    if (stake.status !== MarriageStakeStatus.ACTIVE) {
      throw new BadRequestException('Stake is not in active status');
    }

    if (!marriageProofUrl.trim() || !marriagePhotoUrl.trim()) {
      throw new BadRequestException('Marriage proof URLs are required');
    }

    stake.marriageProofUrl = marriageProofUrl.trim();
    stake.marriagePhotoUrl = marriagePhotoUrl.trim();
    stake.status = MarriageStakeStatus.PROOF_SUBMITTED;
    return this.marriageRepository.save(stake);
  }

  /**
   * Admin/verified action: release stake after marriage proof is verified.
   * Applies a 10% loyalty bonus on top of the staked amount.
   */
  async releaseStake(stakeId: string): Promise<MarriageStake> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stake = await queryRunner.manager.findOne(MarriageStake, {
        where: { id: stakeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!stake) throw new NotFoundException('Marriage stake not found');
      if (stake.status !== MarriageStakeStatus.PROOF_SUBMITTED) {
        throw new BadRequestException('Stake proof has not been submitted');
      }

      const amountPi = Number(stake.amountPi);
      this.assertValidAmount(amountPi);
      const loyaltyBonus = amountPi * LOYALTY_BONUS_PERCENTAGE;
      const totalReturn = amountPi + loyaltyBonus;
      const perUser = totalReturn / 2;

      await queryRunner.manager.increment(
        User,
        { id: stake.user1Id },
        'piBalance',
        perUser,
      );
      await queryRunner.manager.increment(
        User,
        { id: stake.user2Id },
        'piBalance',
        perUser,
      );

      stake.status = MarriageStakeStatus.RELEASED;
      stake.verifiedAt = new Date();
      stake.releasedAt = new Date();
      stake.loyaltyBonusPi = loyaltyBonus;

      const saved = await queryRunner.manager.save(MarriageStake, stake);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private assertValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Stake amount must be greater than zero');
    }
  }
}

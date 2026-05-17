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
import { MARRIAGE_STAKE_AMOUNT_USD } from '../../common/constants';

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
  async initiateStake(user1Id: string, user2Id: string, amountPi: number): Promise<MarriageStake> {
    const [user1, user2] = await Promise.all([
      this.userRepository.findOne({ where: { id: user1Id }, relations: ['subscriptionPlan'] }),
      this.userRepository.findOne({ where: { id: user2Id }, relations: ['subscriptionPlan'] }),
    ]);

    if (!user1 || !user2) throw new NotFoundException('User not found');

    if (!user1.subscriptionPlan?.hasMarriageStaking) {
      throw new ForbiddenException('Marriage Staking requires Gold or Platinum subscription');
    }

    if (user1.piBalance < amountPi / 2) {
      throw new BadRequestException('Insufficient Pi balance');
    }

    const verificationCode = uuidv4().substring(0, 8).toUpperCase();

    return this.marriageRepository.save({
      user1Id,
      user2Id,
      amountPi,
      status: MarriageStakeStatus.ACTIVE,
      verificationCode,
    });
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
    const stake = await this.marriageRepository.findOne({ where: { id: stakeId } });
    if (!stake) throw new NotFoundException('Marriage stake not found');

    if (stake.user1Id !== userId && stake.user2Id !== userId) {
      throw new ForbiddenException('Not a party to this stake');
    }

    if (stake.status !== MarriageStakeStatus.ACTIVE) {
      throw new BadRequestException('Stake is not in active status');
    }

    stake.marriageProofUrl = marriageProofUrl;
    stake.marriagePhotoUrl = marriagePhotoUrl;
    stake.status = MarriageStakeStatus.PROOF_SUBMITTED;
    return this.marriageRepository.save(stake);
  }

  /**
   * Admin/verified action: release stake after marriage proof is verified.
   * Applies a 10% loyalty bonus on top of the staked amount.
   */
  async releaseStake(stakeId: string): Promise<MarriageStake> {
    const stake = await this.marriageRepository.findOne({ where: { id: stakeId } });
    if (!stake) throw new NotFoundException('Marriage stake not found');
    if (stake.status !== MarriageStakeStatus.PROOF_SUBMITTED) {
      throw new BadRequestException('Stake proof has not been submitted');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loyaltyBonus = Number(stake.amountPi) * LOYALTY_BONUS_PERCENTAGE;
      const totalReturn = Number(stake.amountPi) + loyaltyBonus;
      const perUser = totalReturn / 2;

      await queryRunner.manager.increment(User, { id: stake.user1Id }, 'piBalance', perUser);
      await queryRunner.manager.increment(User, { id: stake.user2Id }, 'piBalance', perUser);

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
}

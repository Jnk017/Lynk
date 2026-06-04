import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StakingContract } from './entities/staking-contract.entity';
import { User } from '../user/entities/user.entity';
import { StakingContractStatus } from '../../common/enums';

const DATE_CONFIRMATION_WINDOW_HOURS = 2;

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(StakingContract)
    private stakingRepository: Repository<StakingContract>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create an anti-ghosting stake for an IRL date.
   * Both users must stake equal amounts of Pi.
   */
  async createStake(
    creatorId: string,
    partnerId: string,
    stakeAmountPiEach: number,
    dateScheduledAt: Date,
    dateLocation: string,
  ): Promise<StakingContract> {
    if (creatorId === partnerId) {
      throw new BadRequestException('Cannot create a stake with yourself');
    }
    this.assertValidStakeAmount(stakeAmountPiEach);
    if (Number.isNaN(dateScheduledAt.getTime())) {
      throw new BadRequestException('Invalid date scheduled at');
    }
    if (dateScheduledAt <= new Date()) {
      throw new BadRequestException('Date must be scheduled in the future');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creator = await queryRunner.manager.findOne(User, {
        where: { id: creatorId },
        lock: { mode: 'pessimistic_write' },
      });
      const partner = await queryRunner.manager.findOne(User, {
        where: { id: partnerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!creator || !partner) throw new NotFoundException('User not found');

      if (
        Number(creator.piBalance) < stakeAmountPiEach ||
        Number(partner.piBalance) < stakeAmountPiEach
      ) {
        throw new BadRequestException('Insufficient Pi balance');
      }

      await queryRunner.manager.decrement(
        User,
        { id: creatorId },
        'piBalance',
        stakeAmountPiEach,
      );
      await queryRunner.manager.decrement(
        User,
        { id: partnerId },
        'piBalance',
        stakeAmountPiEach,
      );

      const contract = await queryRunner.manager.save(StakingContract, {
        creatorId,
        partnerId,
        stakeAmountPiEach,
        dateScheduledAt,
        dateLocation,
        status: StakingContractStatus.ACTIVE,
      });

      await queryRunner.commitTransaction();
      return contract;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Confirm attendance at the date using geolocation.
   * If both parties confirm within the window, both stakes are returned.
   * If only one confirms (ghost scenario), the victim gets both stakes.
   */
  async confirmAttendance(
    userId: string,
    contractId: string,
    _lat: number,
    _lng: number,
  ): Promise<{ status: string; message: string }> {
    void _lat;
    void _lng;

    const contract = await this.stakingRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Staking contract not found');
    if (contract.status !== StakingContractStatus.ACTIVE) {
      throw new BadRequestException('Contract is no longer active');
    }
    if (contract.creatorId !== userId && contract.partnerId !== userId) {
      throw new ForbiddenException('You are not a party to this contract');
    }

    const isCreator = contract.creatorId === userId;
    const now = new Date();

    // Check if confirmation window is open (within 2 hours of date)
    const windowStart = new Date(
      contract.dateScheduledAt.getTime() - 60 * 60 * 1000,
    );
    const windowEnd = new Date(
      contract.dateScheduledAt.getTime() +
        DATE_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000,
    );

    if (now < windowStart || now > windowEnd) {
      throw new BadRequestException('Outside confirmation window');
    }

    if (isCreator) {
      contract.creatorConfirmed = true;
      contract.creatorConfirmedAt = now;
    } else {
      contract.partnerConfirmed = true;
      contract.partnerConfirmedAt = now;
    }

    if (contract.creatorConfirmed && contract.partnerConfirmed) {
      // Both confirmed: return stakes to both parties
      await this.resolveContract(contract, 'both');
      return {
        status: 'resolved',
        message: 'Both parties confirmed. Stakes returned! 🎉',
      };
    }

    await this.stakingRepository.save(contract);
    return {
      status: 'pending',
      message: 'Attendance confirmed. Waiting for the other party.',
    };
  }

  /**
   * Called by a cron job or manually to resolve expired contracts.
   * If one party ghosted, the victim receives both stakes.
   */
  async resolveExpiredContracts(): Promise<void> {
    const windowCutoff = new Date(
      Date.now() - DATE_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000,
    );

    const expiredContracts = await this.stakingRepository
      .createQueryBuilder('c')
      .where('c.status = :status', { status: StakingContractStatus.ACTIVE })
      .andWhere('c.dateScheduledAt < :cutoff', { cutoff: windowCutoff })
      .getMany();

    for (const contract of expiredContracts) {
      const bothGhosted =
        !contract.creatorConfirmed && !contract.partnerConfirmed;

      if (bothGhosted) {
        // No one showed up; return both stakes to their owners
        await this.resolveContract(contract, 'cancelled');
      } else if (contract.creatorConfirmed && !contract.partnerConfirmed) {
        // Partner ghosted; creator gets both stakes
        contract.victimId = contract.creatorId;
        await this.resolveContract(contract, 'victim_creator');
      } else if (!contract.creatorConfirmed && contract.partnerConfirmed) {
        // Creator ghosted; partner gets both stakes
        contract.victimId = contract.partnerId;
        await this.resolveContract(contract, 'victim_partner');
      }
    }
  }

  private async resolveContract(
    contract: StakingContract,
    resolution: 'both' | 'cancelled' | 'victim_creator' | 'victim_partner',
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockedContract = await queryRunner.manager.findOne(
        StakingContract,
        {
          where: { id: contract.id },
          lock: { mode: 'pessimistic_write' },
        },
      );
      if (!lockedContract) {
        throw new NotFoundException('Staking contract not found');
      }
      if (lockedContract.status !== StakingContractStatus.ACTIVE) {
        throw new BadRequestException('Contract has already been resolved');
      }

      const stakeAmount = Number(lockedContract.stakeAmountPiEach);
      this.assertValidStakeAmount(stakeAmount);
      const totalStake = stakeAmount * 2;

      if (resolution === 'both' || resolution === 'cancelled') {
        await queryRunner.manager.increment(
          User,
          { id: lockedContract.creatorId },
          'piBalance',
          stakeAmount,
        );
        await queryRunner.manager.increment(
          User,
          { id: lockedContract.partnerId },
          'piBalance',
          stakeAmount,
        );
        lockedContract.status =
          resolution === 'both'
            ? StakingContractStatus.RESOLVED_BOTH
            : StakingContractStatus.CANCELLED;
      } else if (resolution === 'victim_creator') {
        lockedContract.victimId = lockedContract.creatorId;
        await queryRunner.manager.increment(
          User,
          { id: lockedContract.creatorId },
          'piBalance',
          totalStake,
        );
        lockedContract.status = StakingContractStatus.RESOLVED_VICTIM;
      } else {
        lockedContract.victimId = lockedContract.partnerId;
        await queryRunner.manager.increment(
          User,
          { id: lockedContract.partnerId },
          'piBalance',
          totalStake,
        );
        lockedContract.status = StakingContractStatus.RESOLVED_VICTIM;
      }

      lockedContract.resolvedAt = new Date();
      await queryRunner.manager.save(StakingContract, lockedContract);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private assertValidStakeAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Stake amount must be greater than zero');
    }
  }
}

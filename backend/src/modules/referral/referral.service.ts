import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { User } from '../user/entities/user.entity';
import { ReferralLog } from './entities/referral-log.entity';
import { RevenuePool } from './entities/revenue-pool.entity';
import { RevenueDistribution } from './entities/revenue-distribution.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import {
  ReferralStatus,
  RevenuePoolStatus,
  RevenueDistributionStatus,
  TransactionType,
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
} from '../../common/enums';
import {
  REFERRALS_REQUIRED_FOR_REVENUE_SHARING,
  REVENUE_SHARING_PERCENTAGE,
} from '../../common/constants';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ReferralLog)
    private referralLogRepository: Repository<ReferralLog>,
    @InjectRepository(RevenuePool)
    private revenuePoolRepository: Repository<RevenuePool>,
    @InjectRepository(RevenueDistribution)
    private distributionRepository: Repository<RevenueDistribution>,
    private dataSource: DataSource,
    private systemSettingsService: SystemSettingsService,
    private auditLogService: AuditLogService,
  ) {}

  async getReferralStats(userId: string) {
    const referrals = await this.referralLogRepository.find({
      where: { referrerId: userId },
      relations: ['referee'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    return {
      referralCode: user?.referralCode,
      totalReferrals: referrals.length,
      verifiedReferrals: referrals.filter((r) => r.verificationPassed).length,
      qualifyingReferrals: referrals.filter((r) => r.countsForRevenueSharing)
        .length,
      isFounder: user?.isFounder,
      founderRank: user?.founderRank,
      isRevenueSharingActive: user?.isRevenueSharingActive,
      referralsNeeded: Math.max(
        0,
        REFERRALS_REQUIRED_FOR_REVENUE_SHARING -
          referrals.filter((r) => r.countsForRevenueSharing).length,
      ),
    };
  }

  /**
   * Called when a user completes AI verification.
   * Updates the referral log and potentially activates revenue sharing for the referrer.
   */
  async onUserVerified(userId: string): Promise<void> {
    const referralLog = await this.referralLogRepository.findOne({
      where: { refereeId: userId },
    });

    if (!referralLog) return;

    referralLog.verificationPassed = true;
    referralLog.countsForRevenueSharing = true;
    referralLog.status = ReferralStatus.VERIFIED;
    await this.referralLogRepository.save(referralLog);

    await this.userRepository.increment(
      { id: referralLog.referrerId },
      'successfulReferralsCount',
      1,
    );

    // Check if referrer has now reached the threshold for revenue sharing activation
    const referrer = await this.userRepository.findOne({
      where: { id: referralLog.referrerId },
    });
    if (
      referrer?.isFounder &&
      !referrer.isRevenueSharingActive &&
      (referrer.successfulReferralsCount || 0) >=
        REFERRALS_REQUIRED_FOR_REVENUE_SHARING
    ) {
      await this.userRepository.update(referrer.id, {
        isRevenueSharingActive: true,
        revenueSharingJoinedAt: new Date(),
      });
      this.logger.log(
        `Revenue sharing activated for Founder #${referrer.founderRank}: ${referrer.displayName}`,
      );
    }
  }

  /**
   * Monthly cron job: runs on the 1st of every month at 02:00 UTC.
   * Calculates and distributes 5% of last month's revenue equally among
   * all Founders with active revenue sharing.
   *
   * Uses a database transaction to prevent double-distribution.
   */
  @Cron('0 2 1 * *')
  async distributeMonthlyDividends(): Promise<void> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    this.logger.log(
      `Starting monthly revenue distribution for period: ${period}`,
    );

    const existing = await this.revenuePoolRepository.findOne({
      where: { period },
    });
    if (existing && existing.status !== RevenuePoolStatus.CALCULATING) {
      this.logger.warn(`Distribution for period ${period} already processed`);
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `SELECT pg_advisory_xact_lock(hashtext('lynk_revenue_distribution_' || $1))`,
        [period],
      );

      // Calculate total revenue for the period (subscriptions + boosts + gifts)
      const startOfMonth = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const revenueResult = await queryRunner.manager
        .createQueryBuilder(Transaction, 'tx')
        .select('SUM(CAST(tx.amount AS DECIMAL))', 'total')
        .where('tx.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere('tx.currency = :currency', {
          currency: TransactionCurrency.USD,
        })
        .andWhere('tx.createdAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .andWhere('tx.type IN (:...types)', {
          types: [
            TransactionType.SUBSCRIPTION,
            TransactionType.BOOST,
            TransactionType.GIFT,
          ],
        })
        .getRawOne<{ total: string | null }>();

      const totalRevenue = Number.parseFloat(revenueResult?.total || '0');
      const revenueSharingPercentage =
        await this.systemSettingsService.getNumber(
          'revenue_sharing_percentage',
          REVENUE_SHARING_PERCENTAGE,
        );
      const distributableAmount = totalRevenue * revenueSharingPercentage;

      const eligibleFounders = await queryRunner.manager.find(User, {
        where: {
          isFounder: true,
          isRevenueSharingActive: true,
          isBanned: false,
        },
      });

      const activeFounderCount = eligibleFounders.length;
      const dividendPerFounder =
        activeFounderCount > 0 ? distributableAmount / activeFounderCount : 0;

      // Create or update pool record
      let pool = existing || new RevenuePool();
      pool.period = period;
      pool.totalRevenue = totalRevenue;
      pool.distributableAmount = distributableAmount;
      pool.activeFounderCount = activeFounderCount;
      pool.dividendPerFounder = dividendPerFounder;
      pool.status = RevenuePoolStatus.DISTRIBUTING;
      pool = await queryRunner.manager.save(RevenuePool, pool);

      if (activeFounderCount === 0 || dividendPerFounder === 0) {
        pool.status = RevenuePoolStatus.COMPLETED;
        await queryRunner.manager.save(RevenuePool, pool);
        await queryRunner.commitTransaction();
        this.logger.log(
          `No eligible founders for period ${period}. Pool closed.`,
        );
        return;
      }

      // Create distribution records and credit each founder's balance
      const distributions: Partial<RevenueDistribution>[] = [];
      for (const founder of eligibleFounders) {
        distributions.push({
          poolId: pool.id,
          founderId: founder.id,
          amount: dividendPerFounder,
          status: RevenueDistributionStatus.PAID,
          paidAt: new Date(),
        });

        // Credit founder's fiat balance
        await queryRunner.manager.increment(
          User,
          { id: founder.id },
          'fiatBalance',
          dividendPerFounder,
        );

        // Record internal transaction
        await queryRunner.manager.save(Transaction, {
          userId: founder.id,
          type: TransactionType.REVENUE_SHARE,
          currency: TransactionCurrency.USD,
          amount: dividendPerFounder,
          provider: TransactionProvider.INTERNAL,
          status: TransactionStatus.COMPLETED,
          externalRef: `rev_share_${period}_${founder.id}`,
          metadata: { period, poolId: pool.id },
        });
      }

      await queryRunner.manager.save(RevenueDistribution, distributions);

      pool.status = RevenuePoolStatus.COMPLETED;
      await queryRunner.manager.save(RevenuePool, pool);

      await this.auditLogService.record({
        action: 'revenue_sharing.distribute_monthly_dividends',
        targetType: 'RevenuePool',
        targetId: pool.id,
        metadata: {
          period,
          totalRevenue,
          distributableAmount,
          activeFounderCount,
          dividendPerFounder,
        },
      });

      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue distribution for ${period} completed. ${activeFounderCount} founders each received $${dividendPerFounder.toFixed(4)}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Revenue distribution failed for ${period}: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRevenuePoolHistory(limit = 12): Promise<RevenuePool[]> {
    return this.revenuePoolRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFounderDistributions(
    founderId: string,
  ): Promise<RevenueDistribution[]> {
    return this.distributionRepository.find({
      where: { founderId },
      relations: ['pool'],
      order: { createdAt: 'DESC' },
    });
  }
}

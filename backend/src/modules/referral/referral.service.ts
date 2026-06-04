import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
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

export interface RevenueDistributionOptions {
  dryRun?: boolean;
}

export interface RevenueDistributionResult {
  period: string;
  dryRun: boolean;
  idempotent: boolean;
  poolId?: string;
  status: RevenuePoolStatus;
  totalRevenue: number;
  revenueSharingPercentage: number;
  distributableAmount: number;
  activeFounderCount: number;
  dividendPerFounder: number;
  distributionCount: number;
}

interface RevenuePeriodBounds {
  period: string;
  start: Date;
  end: Date;
}

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

    if (!referralLog || referralLog.verificationPassed) return;

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
   * Calculates and distributes last month's configurable revenue share equally
   * among all eligible Founders.
   */
  @Cron('0 2 1 * *')
  async distributeMonthlyDividendsCron(): Promise<void> {
    const result = await this.distributeMonthlyDividends();
    this.logger.log(
      `Revenue distribution cron completed for ${result.period}: ${result.status}`,
    );
  }

  async distributeMonthlyDividends(
    month?: string,
    options: RevenueDistributionOptions = {},
  ): Promise<RevenueDistributionResult> {
    const { period, start, end } = this.resolveRevenuePeriod(month);
    const dryRun = options.dryRun === true;

    this.logger.log(
      `${dryRun ? 'Simulating' : 'Starting'} monthly revenue distribution for period: ${period}`,
    );

    if (dryRun) {
      return this.calculateRevenueDistributionPreview(period, start, end);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `SELECT pg_advisory_xact_lock(hashtext('lynk_revenue_distribution_' || $1))`,
        [period],
      );

      const existing = await queryRunner.manager.findOne(RevenuePool, {
        where: { period },
      });
      if (existing && existing.status === RevenuePoolStatus.COMPLETED) {
        const existingDistributions = await queryRunner.manager.count(
          RevenueDistribution,
          { where: { poolId: existing.id } },
        );
        await queryRunner.commitTransaction();
        return this.toDistributionResult(existing, {
          dryRun: false,
          idempotent: true,
          distributionCount: existingDistributions,
        });
      }

      const preview = await this.calculateRevenueDistributionPreview(
        period,
        start,
        end,
        queryRunner.manager,
      );

      let pool = existing || new RevenuePool();
      pool.period = period;
      pool.idempotencyKey = this.getRevenueDistributionIdempotencyKey(period);
      pool.totalRevenue = preview.totalRevenue;
      pool.distributableAmount = preview.distributableAmount;
      pool.activeFounderCount = preview.activeFounderCount;
      pool.dividendPerFounder = preview.dividendPerFounder;
      pool.status = RevenuePoolStatus.PROCESSING;
      pool = await queryRunner.manager.save(RevenuePool, pool);

      if (
        preview.activeFounderCount === 0 ||
        preview.dividendPerFounder === 0
      ) {
        pool.status = RevenuePoolStatus.COMPLETED;
        await queryRunner.manager.save(RevenuePool, pool);
        await this.recordRevenueDistributionAudit(pool, preview, 0, false);
        await queryRunner.commitTransaction();
        return this.toDistributionResult(pool, {
          dryRun: false,
          idempotent: false,
          distributionCount: 0,
          revenueSharingPercentage: preview.revenueSharingPercentage,
        });
      }

      const eligibleFounders = await this.findEligibleFounders(
        queryRunner.manager,
      );
      const distributions: Partial<RevenueDistribution>[] = [];

      for (const founder of eligibleFounders) {
        const externalRef = this.getFounderDividendExternalRef(
          period,
          founder.id,
        );
        const existingTransaction = await queryRunner.manager.findOne(
          Transaction,
          { where: { externalRef } },
        );
        if (existingTransaction) continue;

        distributions.push({
          poolId: pool.id,
          founderId: founder.id,
          month: period,
          amount: preview.dividendPerFounder,
          status: RevenueDistributionStatus.PAID,
          paidAt: new Date(),
        });

        await queryRunner.manager.increment(
          User,
          { id: founder.id },
          'fiatBalance',
          preview.dividendPerFounder,
        );

        await queryRunner.manager.save(Transaction, {
          userId: founder.id,
          type: TransactionType.REVENUE_SHARE,
          currency: TransactionCurrency.USD,
          amount: preview.dividendPerFounder,
          provider: TransactionProvider.INTERNAL,
          status: TransactionStatus.COMPLETED,
          externalRef,
          metadata: { period, poolId: pool.id },
        });
      }

      if (distributions.length > 0) {
        await queryRunner.manager.save(RevenueDistribution, distributions);
      }

      const totalDistributed =
        distributions.length * preview.dividendPerFounder;
      if (totalDistributed > preview.distributableAmount) {
        throw new Error(
          `Revenue distribution exceeds pool: ${totalDistributed} > ${preview.distributableAmount}`,
        );
      }

      pool.status = RevenuePoolStatus.COMPLETED;
      await queryRunner.manager.save(RevenuePool, pool);

      await this.recordRevenueDistributionAudit(
        pool,
        preview,
        distributions.length,
        false,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue distribution for ${period} completed. ${distributions.length} founders each received $${preview.dividendPerFounder.toFixed(4)}`,
      );

      return this.toDistributionResult(pool, {
        dryRun: false,
        idempotent: false,
        distributionCount: distributions.length,
        revenueSharingPercentage: preview.revenueSharingPercentage,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await this.markRevenuePoolFailed(queryRunner.manager, period);
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

  private resolveRevenuePeriod(month?: string): RevenuePeriodBounds {
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('Revenue distribution month must use YYYY-MM format');
      }
      const [year, monthNumber] = month.split('-').map(Number);
      const start = new Date(Date.UTC(year, monthNumber - 1, 1));
      const end = new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999));
      return { period: month, start, end };
    }

    const now = new Date();
    const lastMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );
    const period = `${lastMonth.getUTCFullYear()}-${String(lastMonth.getUTCMonth() + 1).padStart(2, '0')}`;
    const start = new Date(
      Date.UTC(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), 1),
    );
    const end = new Date(
      Date.UTC(
        lastMonth.getUTCFullYear(),
        lastMonth.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );
    return { period, start, end };
  }

  private async markRevenuePoolFailed(
    manager: EntityManager,
    period: string,
  ): Promise<void> {
    try {
      const existing = await manager.findOne(RevenuePool, {
        where: { period },
      });
      const pool = existing || new RevenuePool();
      pool.period = period;
      pool.idempotencyKey = this.getRevenueDistributionIdempotencyKey(period);
      pool.status = RevenuePoolStatus.FAILED;
      await manager.save(RevenuePool, pool);
    } catch (failureMarkerError) {
      this.logger.warn(
        `Unable to persist failed revenue pool marker for ${period}: ${failureMarkerError}`,
      );
    }
  }

  private async calculateRevenueDistributionPreview(
    period: string,
    start: Date,
    end: Date,
    manager?: EntityManager,
  ): Promise<RevenueDistributionResult> {
    const entityManager = manager || this.dataSource.manager;
    const revenueResult = await entityManager
      .createQueryBuilder(Transaction, 'tx')
      .select('SUM(CAST(tx.amount AS DECIMAL))', 'total')
      .where('tx.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('tx.currency = :currency', {
        currency: TransactionCurrency.USD,
      })
      .andWhere('tx.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('tx.type IN (:...types)', {
        types: [
          TransactionType.SUBSCRIPTION,
          TransactionType.BOOST,
          TransactionType.GIFT,
        ],
      })
      .getRawOne<{ total: string | null }>();

    const totalRevenue = Number.parseFloat(revenueResult?.total || '0');
    const revenueSharingPercentage = await this.systemSettingsService.getNumber(
      'revenue_sharing_percentage',
      REVENUE_SHARING_PERCENTAGE,
    );
    const eligibleFounders = await this.findEligibleFounders(entityManager);
    const distributableAmount = totalRevenue * revenueSharingPercentage;
    const activeFounderCount = eligibleFounders.length;
    const dividendPerFounder =
      activeFounderCount > 0 ? distributableAmount / activeFounderCount : 0;

    return {
      period,
      dryRun: true,
      idempotent: false,
      status: RevenuePoolStatus.CALCULATING,
      totalRevenue,
      revenueSharingPercentage,
      distributableAmount,
      activeFounderCount,
      dividendPerFounder,
      distributionCount: activeFounderCount,
    };
  }

  private async findEligibleFounders(manager: EntityManager): Promise<User[]> {
    return manager.find(User, {
      where: {
        isFounder: true,
        isRevenueSharingActive: true,
        isBanned: false,
      },
      order: { founderRank: 'ASC' },
    });
  }

  private async recordRevenueDistributionAudit(
    pool: RevenuePool,
    result: RevenueDistributionResult,
    distributionCount: number,
    dryRun: boolean,
  ): Promise<void> {
    await this.auditLogService.record({
      action: dryRun
        ? 'revenue_sharing.distribute_monthly_dividends.dry_run'
        : 'revenue_sharing.distribute_monthly_dividends',
      targetType: 'RevenuePool',
      targetId: pool.id,
      metadata: {
        period: result.period,
        totalRevenue: result.totalRevenue,
        revenueSharingPercentage: result.revenueSharingPercentage,
        distributableAmount: result.distributableAmount,
        activeFounderCount: result.activeFounderCount,
        dividendPerFounder: result.dividendPerFounder,
        distributionCount,
        idempotencyKey: pool.idempotencyKey,
      },
    });
  }

  private toDistributionResult(
    pool: RevenuePool,
    options: {
      dryRun: boolean;
      idempotent: boolean;
      distributionCount: number;
      revenueSharingPercentage?: number;
    },
  ): RevenueDistributionResult {
    return {
      period: pool.period,
      dryRun: options.dryRun,
      idempotent: options.idempotent,
      poolId: pool.id,
      status: pool.status,
      totalRevenue: Number(pool.totalRevenue),
      revenueSharingPercentage:
        options.revenueSharingPercentage ?? REVENUE_SHARING_PERCENTAGE,
      distributableAmount: Number(pool.distributableAmount),
      activeFounderCount: pool.activeFounderCount,
      dividendPerFounder: Number(pool.dividendPerFounder),
      distributionCount: options.distributionCount,
    };
  }

  private getRevenueDistributionIdempotencyKey(period: string): string {
    return `revenue_distribution:${period}`;
  }

  private getFounderDividendExternalRef(
    period: string,
    founderId: string,
  ): string {
    return `rev_share_${period}_${founderId}`;
  }
}

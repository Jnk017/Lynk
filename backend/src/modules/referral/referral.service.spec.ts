import { DataSource, Repository } from 'typeorm';
import { ReferralService } from './referral.service';
import { RevenuePool } from './entities/revenue-pool.entity';
import { RevenueDistribution } from './entities/revenue-distribution.entity';
import { ReferralLog } from './entities/referral-log.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import {
  RevenuePoolStatus,
  RevenueDistributionStatus,
} from '../../common/enums';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { AuditLogService } from '../audit-log/audit-log.service';

interface RevenueTestStore {
  pools: RevenuePool[];
  distributions: RevenueDistribution[];
  transactions: Transaction[];
  founders: User[];
  increments: Array<{ userId: string; amount: number }>;
}

interface RevenueManagerMock {
  createQueryBuilder: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  count: jest.Mock;
  save: jest.Mock;
  increment: jest.Mock;
}

interface QueryRunnerMock {
  manager: RevenueManagerMock;
  connect: jest.Mock<Promise<void>, []>;
  startTransaction: jest.Mock<Promise<void>, []>;
  commitTransaction: jest.Mock<Promise<void>, []>;
  rollbackTransaction: jest.Mock<Promise<void>, []>;
  release: jest.Mock<Promise<void>, []>;
  query: jest.Mock<Promise<void>, [string, unknown[]?]>;
}

function createFounder(id: string, founderRank: number): User {
  return {
    id,
    isFounder: true,
    isRevenueSharingActive: true,
    isBanned: false,
    founderRank,
  } as User;
}

function createRevenuePool(overrides: Partial<RevenuePool>): RevenuePool {
  return {
    id: overrides.id || 'pool-1',
    period: overrides.period || '2026-05',
    idempotencyKey: overrides.idempotencyKey || 'revenue_distribution:2026-05',
    totalRevenue: overrides.totalRevenue ?? 1000,
    distributableAmount: overrides.distributableAmount ?? 50,
    activeFounderCount: overrides.activeFounderCount ?? 2,
    dividendPerFounder: overrides.dividendPerFounder ?? 25,
    status: overrides.status || RevenuePoolStatus.COMPLETED,
    distributions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

function createResolvedVoidMock(): jest.Mock<Promise<void>, []> {
  return jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
}

function createQueryMock(): jest.Mock<Promise<void>, [string, unknown[]?]> {
  return jest
    .fn<Promise<void>, [string, unknown[]?]>()
    .mockResolvedValue(undefined);
}

function getFindOneWhere(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || !('where' in input)) {
    return {};
  }
  const where = (input as { where?: unknown }).where;
  return typeof where === 'object' && where !== null
    ? (where as Record<string, unknown>)
    : {};
}

function createRevenueManager(
  store: RevenueTestStore,
  totalRevenue = '1000',
): RevenueManagerMock {
  const manager: RevenueManagerMock = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
  };

  manager.createQueryBuilder.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ total: totalRevenue }),
  });

  manager.find.mockImplementation((entity: unknown) => {
    if (entity === User) return Promise.resolve(store.founders);
    return Promise.resolve([]);
  });

  manager.findOne.mockImplementation((entity: unknown, input: unknown) => {
    const where = getFindOneWhere(input);
    if (entity === RevenuePool && typeof where.period === 'string') {
      return Promise.resolve(
        store.pools.find((pool) => pool.period === where.period) || null,
      );
    }
    if (entity === Transaction && typeof where.externalRef === 'string') {
      return Promise.resolve(
        store.transactions.find((tx) => tx.externalRef === where.externalRef) ||
          null,
      );
    }
    return Promise.resolve(null);
  });

  manager.count.mockImplementation((entity: unknown, input: unknown) => {
    const where = getFindOneWhere(input);
    if (entity === RevenueDistribution && typeof where.poolId === 'string') {
      return Promise.resolve(
        store.distributions.filter(
          (distribution) => distribution.poolId === where.poolId,
        ).length,
      );
    }
    return Promise.resolve(0);
  });

  manager.save.mockImplementation(
    (
      entity: unknown,
      payload:
        | RevenuePool
        | Partial<RevenueDistribution>[]
        | Partial<Transaction>,
    ) => {
      if (entity === RevenuePool) {
        const poolPayload = payload as RevenuePool;
        const existing = store.pools.find(
          (pool) => pool.period === poolPayload.period,
        );
        const saved = createRevenuePool({
          ...existing,
          ...poolPayload,
          id: poolPayload.id || existing?.id || 'pool-1',
        });
        if (existing) Object.assign(existing, saved);
        else store.pools.push(saved);
        return Promise.resolve(saved);
      }

      if (entity === RevenueDistribution && Array.isArray(payload)) {
        const saved = payload.map(
          (distribution, index) =>
            ({
              id: `distribution-${store.distributions.length + index + 1}`,
              ...distribution,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            }) as RevenueDistribution,
        );
        store.distributions.push(...saved);
        return Promise.resolve(saved);
      }

      if (entity === Transaction) {
        const tx = {
          id: `tx-${store.transactions.length + 1}`,
          ...(payload as Partial<Transaction>),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as Transaction;
        store.transactions.push(tx);
        return Promise.resolve(tx);
      }

      return Promise.resolve(payload);
    },
  );

  manager.increment.mockImplementation(
    (
      _entity: unknown,
      criteria: { id: string },
      _field: string,
      amount: number,
    ) => {
      store.increments.push({ userId: criteria.id, amount });
      return Promise.resolve({ affected: 1, generatedMaps: [], raw: {} });
    },
  );

  return manager;
}

function createServiceHarness(store: RevenueTestStore, totalRevenue = '1000') {
  const manager = createRevenueManager(store, totalRevenue);
  const queryRunner: QueryRunnerMock = {
    manager,
    connect: createResolvedVoidMock(),
    startTransaction: createResolvedVoidMock(),
    commitTransaction: createResolvedVoidMock(),
    rollbackTransaction: createResolvedVoidMock(),
    release: createResolvedVoidMock(),
    query: createQueryMock(),
  };
  const dataSource = {
    manager,
    createQueryRunner: jest.fn(() => queryRunner),
  } as unknown as DataSource;
  const systemSettingsService = {
    getNumber: jest.fn().mockResolvedValue(0.05),
  } as jest.Mocked<Pick<SystemSettingsService, 'getNumber'>>;
  const auditLogService = {
    record: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<Pick<AuditLogService, 'record'>>;

  const service = new ReferralService(
    {} as Repository<User>,
    {} as Repository<ReferralLog>,
    {} as Repository<RevenuePool>,
    {} as Repository<RevenueDistribution>,
    dataSource,
    systemSettingsService as unknown as SystemSettingsService,
    auditLogService as unknown as AuditLogService,
  );

  return {
    service,
    manager,
    queryRunner,
    systemSettingsService,
    auditLogService,
  };
}

describe('ReferralService revenue sharing idempotency', () => {
  it('distributes monthly dividends once across eligible founders', async () => {
    const store: RevenueTestStore = {
      pools: [],
      distributions: [],
      transactions: [],
      founders: [createFounder('founder-1', 1), createFounder('founder-2', 2)],
      increments: [],
    };
    const { service, queryRunner, auditLogService } =
      createServiceHarness(store);

    const result = await service.distributeMonthlyDividends('2026-05');

    expect(result).toMatchObject({
      period: '2026-05',
      dryRun: false,
      idempotent: false,
      totalRevenue: 1000,
      revenueSharingPercentage: 0.05,
      distributableAmount: 50,
      activeFounderCount: 2,
      dividendPerFounder: 25,
      distributionCount: 2,
      status: RevenuePoolStatus.COMPLETED,
    });
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      ['2026-05'],
    );
    expect(store.pools[0]).toMatchObject({
      period: '2026-05',
      idempotencyKey: 'revenue_distribution:2026-05',
      status: RevenuePoolStatus.COMPLETED,
    });
    expect(store.distributions).toHaveLength(2);
    expect(store.distributions.map((dist) => dist.status)).toEqual([
      RevenueDistributionStatus.PAID,
      RevenueDistributionStatus.PAID,
    ]);
    expect(store.transactions.map((tx) => tx.externalRef).sort()).toEqual([
      'rev_share_2026-05_founder-1',
      'rev_share_2026-05_founder-2',
    ]);
    expect(store.increments).toEqual([
      { userId: 'founder-1', amount: 25 },
      { userId: 'founder-2', amount: 25 },
    ]);
    expect(auditLogService.record).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('returns an idempotent result without double-paying a completed month', async () => {
    const existingPool = createRevenuePool({ id: 'pool-existing' });
    const store: RevenueTestStore = {
      pools: [existingPool],
      distributions: [
        { id: 'dist-1', poolId: existingPool.id } as RevenueDistribution,
        { id: 'dist-2', poolId: existingPool.id } as RevenueDistribution,
      ],
      transactions: [],
      founders: [createFounder('founder-1', 1), createFounder('founder-2', 2)],
      increments: [],
    };
    const { service, manager, queryRunner, auditLogService } =
      createServiceHarness(store);

    const result = await service.distributeMonthlyDividends('2026-05');

    expect(result).toMatchObject({
      poolId: 'pool-existing',
      idempotent: true,
      distributionCount: 2,
      status: RevenuePoolStatus.COMPLETED,
    });
    expect(manager.increment).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
    expect(auditLogService.record).not.toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('closes the pool without payouts when no founders are eligible', async () => {
    const store: RevenueTestStore = {
      pools: [],
      distributions: [],
      transactions: [],
      founders: [],
      increments: [],
    };
    const { service, auditLogService } = createServiceHarness(store);

    const result = await service.distributeMonthlyDividends('2026-05');

    expect(result).toMatchObject({
      activeFounderCount: 0,
      dividendPerFounder: 0,
      distributionCount: 0,
      status: RevenuePoolStatus.COMPLETED,
    });
    expect(store.distributions).toHaveLength(0);
    expect(store.transactions).toHaveLength(0);
    expect(store.increments).toHaveLength(0);
    expect(auditLogService.record).toHaveBeenCalledTimes(1);
  });

  it('supports dry-run simulations without writing pool, distribution, transaction, or balance changes', async () => {
    const store: RevenueTestStore = {
      pools: [],
      distributions: [],
      transactions: [],
      founders: [createFounder('founder-1', 1), createFounder('founder-2', 2)],
      increments: [],
    };
    const { service, queryRunner, auditLogService } =
      createServiceHarness(store);

    const result = await service.distributeMonthlyDividends('2026-05', {
      dryRun: true,
    });

    expect(result).toMatchObject({
      period: '2026-05',
      dryRun: true,
      status: RevenuePoolStatus.CALCULATING,
      distributableAmount: 50,
      dividendPerFounder: 25,
      distributionCount: 2,
    });
    expect(store.pools).toHaveLength(0);
    expect(store.distributions).toHaveLength(0);
    expect(store.transactions).toHaveLength(0);
    expect(store.increments).toHaveLength(0);
    expect(queryRunner.connect).not.toHaveBeenCalled();
    expect(auditLogService.record).not.toHaveBeenCalled();
  });

  it('rolls back when a payout write fails', async () => {
    const store: RevenueTestStore = {
      pools: [],
      distributions: [],
      transactions: [],
      founders: [createFounder('founder-1', 1)],
      increments: [],
    };
    const { service, manager, queryRunner } = createServiceHarness(store);
    manager.save.mockImplementationOnce(() =>
      Promise.resolve(
        createRevenuePool({ status: RevenuePoolStatus.PROCESSING }),
      ),
    );
    manager.save.mockImplementationOnce(() =>
      Promise.reject(new Error('transaction write failed')),
    );

    await expect(service.distributeMonthlyDividends('2026-05')).rejects.toThrow(
      'transaction write failed',
    );
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
  });
});

import { BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { MAX_FOUNDERS } from '../../common/constants';
import { User } from '../user/entities/user.entity';
import { Founder } from './entities/founder.entity';
import { FounderService } from './founder.service';

interface MaxFounderQueryBuilderMock {
  withDeleted: jest.Mock<MaxFounderQueryBuilderMock, []>;
  select: jest.Mock<MaxFounderQueryBuilderMock, [string, string]>;
  getRawOne: jest.Mock<Promise<{ max: number }>, []>;
}

interface FounderManagerMock {
  query: jest.Mock<Promise<void>, [string]>;
  findOne: jest.Mock<
    Promise<Founder | null>,
    [typeof Founder, { where: { userId: string }; withDeleted?: boolean }]
  >;
  createQueryBuilder: jest.Mock<
    MaxFounderQueryBuilderMock,
    [typeof Founder, string]
  >;
  save: jest.Mock<Promise<Founder>, [typeof Founder, Partial<Founder>]>;
  update: jest.Mock<
    Promise<UpdateResult>,
    [typeof User, string, Partial<User>]
  >;
}

interface FounderStore {
  founders: Founder[];
  updatedUsers: Array<{ userId: string; founderRank?: number }>;
}

function createFounder(overrides: Partial<Founder>): Founder {
  return {
    id: overrides.id || `founder-${overrides.founderNumber || 0}`,
    userId: overrides.userId || `user-${overrides.founderNumber || 0}`,
    user: null,
    founderNumber: overrides.founderNumber || 0,
    lifetimePremium: overrides.lifetimePremium ?? true,
    revenueSharingEligible: overrides.revenueSharingEligible ?? false,
    revenueSharingActivatedAt: overrides.revenueSharingActivatedAt || null,
    metadata: overrides.metadata || {},
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    deletedAt: overrides.deletedAt || null,
  };
}

function createUpdateResult(): UpdateResult {
  return { affected: 1, generatedMaps: [], raw: {} };
}

function createQueryBuilder(store: FounderStore): MaxFounderQueryBuilderMock {
  const builder: MaxFounderQueryBuilderMock = {
    withDeleted: jest.fn(() => builder),
    select: jest.fn((selection: string, alias: string) => {
      void selection;
      void alias;
      return builder;
    }),
    getRawOne: jest.fn(() =>
      Promise.resolve({
        max: Math.max(
          0,
          ...store.founders.map((founder) => founder.founderNumber),
        ),
      }),
    ),
  };
  return builder;
}

function createFounderManager(store: FounderStore): FounderManagerMock {
  return {
    query: jest.fn((sql: string) => {
      void sql;
      return Promise.resolve();
    }),
    findOne: jest.fn((_entity, options) => {
      const founder =
        store.founders.find((item) => item.userId === options.where.userId) ||
        null;
      return Promise.resolve(founder);
    }),
    createQueryBuilder: jest.fn((entity: typeof Founder, alias: string) => {
      void entity;
      void alias;
      return createQueryBuilder(store);
    }),
    save: jest.fn((_entity, input) => {
      const founder = createFounder({
        ...input,
        id: `founder-${input.founderNumber}`,
      });
      store.founders.push(founder);
      return Promise.resolve(founder);
    }),
    update: jest.fn((_entity, userId, input) => {
      store.updatedUsers.push({ userId, founderRank: input.founderRank });
      return Promise.resolve(createUpdateResult());
    }),
  };
}

async function runWithSimulatedAdvisoryLock<T>(
  tasks: Array<() => Promise<T>>,
): Promise<T[]> {
  let chain = Promise.resolve();
  return Promise.all(
    tasks.map((task) => {
      const previous = chain;
      let release!: () => void;
      chain = new Promise<void>((resolve) => {
        release = resolve;
      });
      return previous.then(async () => {
        try {
          return await task();
        } finally {
          release();
        }
      });
    }),
  );
}

describe('FounderService allocation safety', () => {
  let service: FounderService;

  beforeEach(() => {
    service = new FounderService({} as Repository<Founder>, {} as DataSource);
  });

  it('allocates unique founder numbers for concurrent requests when advisory lock serializes access', async () => {
    const store: FounderStore = { founders: [], updatedUsers: [] };
    const manager = createFounderManager(store);
    const userIds = Array.from(
      { length: 25 },
      (_, index) => `user-${index + 1}`,
    );

    const founders = await runWithSimulatedAdvisoryLock(
      userIds.map(
        (userId) => () =>
          service.allocateFounderSlotWithManager(
            manager as unknown as EntityManager,
            userId,
          ),
      ),
    );

    const founderNumbers = founders.map((founder) => founder.founderNumber);
    expect(new Set(founderNumbers).size).toBe(userIds.length);
    expect(founderNumbers.sort((a, b) => a - b)).toEqual(
      userIds.map((_, index) => index + 1),
    );
    expect(manager.query).toHaveBeenCalledTimes(userIds.length);
    expect(manager.save).toHaveBeenCalledTimes(userIds.length);
    expect(store.updatedUsers).toHaveLength(userIds.length);
  });

  it('returns an existing founder slot for the same user without allocating another number', async () => {
    const existingFounder = createFounder({
      userId: 'user-1',
      founderNumber: 7,
    });
    const store: FounderStore = {
      founders: [existingFounder],
      updatedUsers: [],
    };
    const manager = createFounderManager(store);

    const founder = await service.allocateFounderSlotWithManager(
      manager as unknown as EntityManager,
      'user-1',
    );

    expect(founder).toBe(existingFounder);
    expect(manager.save).not.toHaveBeenCalled();
    expect(store.founders).toHaveLength(1);
  });

  it('refuses the 2501st founder when the absolute founder number cap has been reached', async () => {
    const store: FounderStore = {
      founders: Array.from({ length: MAX_FOUNDERS }, (_, index) =>
        createFounder({
          userId: `user-${index + 1}`,
          founderNumber: index + 1,
        }),
      ),
      updatedUsers: [],
    };
    const manager = createFounderManager(store);

    await expect(
      service.allocateFounderSlotWithManager(
        manager as unknown as EntityManager,
        'user-2501',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
    expect(store.founders).toHaveLength(MAX_FOUNDERS);
  });
});

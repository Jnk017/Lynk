import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubscriptionTier, TransactionType } from '../../common/enums';
import { ObservabilityService } from '../observability/observability.service';
import { PaymentService } from '../payment/payment.service';
import { Transaction } from '../payment/entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionService } from './subscription.service';

interface QueryRunnerMock {
  connect: jest.Mock;
  startTransaction: jest.Mock;
  commitTransaction: jest.Mock;
  rollbackTransaction: jest.Mock;
  release: jest.Mock;
  manager: {
    update: jest.Mock;
    findOne: jest.Mock;
  };
}

interface DataSourceMock {
  createQueryRunner: jest.Mock<QueryRunnerMock, []>;
}

function buildService(options: { userFound?: boolean } = {}) {
  const plan = Object.assign(new SubscriptionPlan(), {
    id: 'plan-gold',
    name: SubscriptionTier.GOLD,
  });
  const user = Object.assign(new User(), { id: 'user-1' });
  const planRepository = {
    find: jest.fn(),
    findOne: jest.fn().mockResolvedValue(plan),
    save: jest.fn(),
  };
  const userRepository = {};
  const transactionRepository = {};
  const paymentService = {
    getCompletedTransactionForUse: jest.fn(),
  };
  const manager = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest
      .fn()
      .mockResolvedValue(options.userFound === false ? null : user),
  };
  const queryRunner: QueryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager,
  };
  const dataSource: DataSourceMock = {
    createQueryRunner: jest.fn(() => queryRunner),
  };
  const observabilityService = { track: jest.fn() };
  const service = new SubscriptionService(
    planRepository as unknown as Repository<SubscriptionPlan>,
    userRepository as Repository<User>,
    transactionRepository as Repository<Transaction>,
    dataSource as never,
    paymentService as unknown as PaymentService,
    observabilityService as unknown as ObservabilityService,
  );

  return { manager, paymentService, queryRunner, service };
}

describe('SubscriptionService paid activation safety', () => {
  it('rejects paid plans without a verified payment transaction', async () => {
    const { service } = buildService();

    await expect(
      service.subscribeToPlan('user-1', SubscriptionTier.GOLD),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects paid plans when the completed transaction amount is too low', async () => {
    const { paymentService, service } = buildService();
    paymentService.getCompletedTransactionForUse.mockResolvedValueOnce({
      id: 'tx-1',
      amount: 1,
      metadata: {},
    });

    await expect(
      service.subscribeToPlan('user-1', SubscriptionTier.GOLD, 'tx-1'),
    ).rejects.toThrow('Payment amount is lower than the selected plan price');
    expect(paymentService.getCompletedTransactionForUse).toHaveBeenCalledWith(
      'user-1',
      'tx-1',
      TransactionType.SUBSCRIPTION,
    );
  });

  it('marks the completed payment transaction as consumed during activation', async () => {
    const { manager, paymentService, queryRunner, service } = buildService();
    paymentService.getCompletedTransactionForUse.mockResolvedValueOnce({
      id: 'tx-1',
      amount: 100,
      metadata: { provider: 'test' },
    });

    await service.subscribeToPlan('user-1', SubscriptionTier.GOLD, 'tx-1');

    expect(manager.update).toHaveBeenCalledWith(
      Transaction,
      'tx-1',
      expect.objectContaining({
        metadata: expect.objectContaining({
          provider: 'test',
          subscriptionTier: SubscriptionTier.GOLD,
        }),
      }),
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('rolls back when the user cannot be reloaded after activation update', async () => {
    const { paymentService, queryRunner, service } = buildService({
      userFound: false,
    });
    paymentService.getCompletedTransactionForUse.mockResolvedValueOnce({
      id: 'tx-1',
      amount: 100,
      metadata: {},
    });

    await expect(
      service.subscribeToPlan('user-1', SubscriptionTier.GOLD, 'tx-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });
});

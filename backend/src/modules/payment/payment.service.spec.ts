import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { PaymentService } from './payment.service';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '../../common/enums';
import { PiPaymentProvider } from './providers/pi-payment.provider';
import { MonerooPaymentProviderStub } from './providers/moneroo-payment-provider.stub';
import { AvadaPayPaymentProviderStub } from './providers/avadapay-payment-provider.stub';
import { CoinbaseCommerceProviderStub } from './providers/coinbase-commerce-provider.stub';

interface RepositoryMock<T extends object> {
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  save: jest.Mock<Promise<T>, [Partial<T>]>;
  update: jest.Mock<Promise<unknown>, [unknown, Partial<T>]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
}

function createRepositoryMock<T extends object>(): RepositoryMock<T> {
  return {
    findOne: jest.fn<Promise<T | null>, [unknown]>().mockResolvedValue(null),
    save: jest
      .fn<Promise<T>, [Partial<T>]>()
      .mockImplementation((input) =>
        Promise.resolve({ id: 'saved-id', ...input } as T),
      ),
    update: jest
      .fn<Promise<unknown>, [unknown, Partial<T>]>()
      .mockResolvedValue({ affected: 1 }),
    find: jest.fn<Promise<T[]>, [unknown?]>().mockResolvedValue([]),
  };
}

function createConfigService(nodeEnv = 'development'): ConfigService {
  return {
    get: jest.fn((key: string) => {
      if (key === 'nodeEnv') return nodeEnv;
      if (key === 'stripe.secretKey') return '';
      return undefined;
    }),
  } as unknown as ConfigService;
}

function createPaymentService(nodeEnv = 'development') {
  const transactionRepository = createRepositoryMock<Transaction>();
  const webhookLogRepository = createRepositoryMock<PaymentWebhookLog>();
  const userRepository = createRepositoryMock<User>();
  const configService = createConfigService(nodeEnv);
  const piProvider = {
    createPayment: jest.fn(),
    verifyPayment: jest.fn(),
    handleWebhook: jest.fn(),
  } as unknown as PiPaymentProvider;
  const monerooProvider = new MonerooPaymentProviderStub(configService);
  const avadaPayProvider = new AvadaPayPaymentProviderStub(configService);
  const coinbaseProvider = new CoinbaseCommerceProviderStub(configService);

  const service = new PaymentService(
    transactionRepository as unknown as Repository<Transaction>,
    webhookLogRepository as unknown as Repository<PaymentWebhookLog>,
    userRepository as unknown as Repository<User>,
    configService,
    {} as DataSource,
    piProvider,
    monerooProvider,
    avadaPayProvider,
    coinbaseProvider,
  );

  return { service, transactionRepository, webhookLogRepository };
}

describe('Payment provider stubs', () => {
  it('creates test-mode provider payments as pending transactions', async () => {
    const { service, transactionRepository } = createPaymentService();

    const result = await service.createProviderPayment(
      'user-1',
      TransactionProvider.MONEROO,
      12.5,
      TransactionCurrency.USD,
      TransactionType.SUBSCRIPTION,
    );

    expect(result.provider).toBe(TransactionProvider.MONEROO);
    expect(result.externalRef).toContain('test_moneroo_user-1_');
    expect(result.transactionId).toBe('saved-id');
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        amount: 12.5,
        provider: TransactionProvider.MONEROO,
        status: TransactionStatus.PENDING,
      }),
    );
  });

  it('rejects invalid payment amounts before provider calls', async () => {
    const { service } = createPaymentService();

    await expect(
      service.createProviderPayment(
        'user-1',
        TransactionProvider.MONEROO,
        0,
        TransactionCurrency.USD,
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('disables unfinished providers in production', async () => {
    const { service } = createPaymentService('production');

    await expect(
      service.createProviderPayment(
        'user-1',
        TransactionProvider.MONEROO,
        10,
        TransactionCurrency.USD,
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toThrow('provider stub is disabled in production');
  });

  it('logs generic provider webhooks once using provider and external event id', async () => {
    const { service, webhookLogRepository } = createPaymentService();

    const result = await service.handleProviderWebhook(
      TransactionProvider.COINBASE_COMMERCE,
      {
        eventId: 'evt-1',
        eventType: 'charge:confirmed',
        externalRef: 'charge-1',
      },
      { 'x-test': 'true' },
    );

    expect(result).toMatchObject({
      provider: TransactionProvider.COINBASE_COMMERCE,
      externalEventId: 'evt-1',
      duplicate: false,
      logId: 'saved-id',
    });
    expect(webhookLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: TransactionProvider.COINBASE_COMMERCE,
        externalEventId: 'evt-1',
        externalRef: 'charge-1',
        processed: false,
      }),
    );
  });

  it('does not process duplicate provider webhook event ids twice', async () => {
    const { service, webhookLogRepository } = createPaymentService();
    webhookLogRepository.findOne.mockResolvedValueOnce({
      id: 'existing-log',
    } as PaymentWebhookLog);

    const result = await service.handleProviderWebhook(
      TransactionProvider.AVADAPAY,
      { eventId: 'evt-duplicate', externalRef: 'payment-1' },
      {},
    );

    expect(result).toMatchObject({ duplicate: true, logId: 'existing-log' });
    expect(webhookLogRepository.save).not.toHaveBeenCalled();
  });
});

describe('Payment transaction consumption safety', () => {
  it('returns a completed transaction that belongs to the user and type', async () => {
    const { service, transactionRepository } = createPaymentService();
    transactionRepository.findOne.mockResolvedValueOnce({
      id: 'tx-1',
      userId: 'user-1',
      type: TransactionType.SUBSCRIPTION,
      status: TransactionStatus.COMPLETED,
      metadata: {},
    } as unknown as Transaction);

    const transaction = await service.getCompletedTransactionForUse(
      'user-1',
      'tx-1',
      TransactionType.SUBSCRIPTION,
    );

    expect(transaction.id).toBe('tx-1');
    expect(transactionRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'tx-1',
        userId: 'user-1',
        type: TransactionType.SUBSCRIPTION,
        status: TransactionStatus.COMPLETED,
      },
    });
  });

  it('rejects already-consumed subscription transactions', async () => {
    const { service, transactionRepository } = createPaymentService();
    transactionRepository.findOne.mockResolvedValueOnce({
      id: 'tx-1',
      metadata: { subscriptionActivatedAt: '2026-06-03T00:00:00.000Z' },
    } as unknown as Transaction);

    await expect(
      service.getCompletedTransactionForUse(
        'user-1',
        'tx-1',
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toThrow('already been consumed');
  });

  it('merges consumption metadata without dropping existing metadata', async () => {
    const { service, transactionRepository } = createPaymentService();
    transactionRepository.findOne.mockResolvedValueOnce({
      id: 'tx-1',
      metadata: { providerRef: 'pi-1' },
    } as unknown as Transaction);

    await service.markTransactionConsumed('tx-1', {
      subscriptionActivatedAt: '2026-06-03T00:00:00.000Z',
    });

    expect(transactionRepository.update).toHaveBeenCalledWith('tx-1', {
      metadata: {
        providerRef: 'pi-1',
        subscriptionActivatedAt: '2026-06-03T00:00:00.000Z',
      },
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '../../common/enums';
import { User } from '../user/entities/user.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentService } from './payment.service';
import { BinancePayPaymentProviderStub } from './providers/binance-pay-payment-provider.stub';
import { PawapayPaymentProviderStub } from './providers/pawapay-payment-provider.stub';
import { PiPaymentProvider } from './providers/pi-payment.provider';

interface RepositoryMock<T extends object> {
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  save: jest.Mock<Promise<T>, [Partial<T>]>;
  update: jest.Mock<Promise<unknown>, [unknown, Partial<T>]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  increment: jest.Mock<Promise<unknown>, [unknown, string, number]>;
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
    increment: jest
      .fn<Promise<unknown>, [unknown, string, number]>()
      .mockResolvedValue({ affected: 1 }),
  };
}

function createConfigService(nodeEnv = 'development'): ConfigService {
  return {
    get: jest.fn((key: string) => (key === 'nodeEnv' ? nodeEnv : undefined)),
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
  const pawapayProvider = new PawapayPaymentProviderStub(configService);
  const binancePayProvider = new BinancePayPaymentProviderStub(configService);

  const service = new PaymentService(
    transactionRepository as unknown as Repository<Transaction>,
    webhookLogRepository as unknown as Repository<PaymentWebhookLog>,
    userRepository as unknown as Repository<User>,
    piProvider,
    pawapayProvider,
    binancePayProvider,
  );

  return { service, transactionRepository, webhookLogRepository };
}

describe('Payment provider stubs', () => {
  it('creates Pawapay test-mode provider payments as pending transactions', async () => {
    const { service, transactionRepository } = createPaymentService();

    const result = await service.createProviderPayment(
      'user-1',
      TransactionProvider.PAWAPAY,
      12.5,
      TransactionCurrency.USD,
      TransactionType.SUBSCRIPTION,
    );

    expect(result.provider).toBe(TransactionProvider.PAWAPAY);
    expect(result.externalRef).toContain('test_pawapay_user-1_');
    expect(result.transactionId).toBe('saved-id');
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        amount: 12.5,
        provider: TransactionProvider.PAWAPAY,
        status: TransactionStatus.PENDING,
      }),
    );
  });

  it('rejects invalid payment amounts before provider calls', async () => {
    const { service } = createPaymentService();

    await expect(
      service.createProviderPayment(
        'user-1',
        TransactionProvider.PAWAPAY,
        0,
        TransactionCurrency.USD,
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires provider credentials in production', async () => {
    const { service } = createPaymentService('production');

    await expect(
      service.createProviderPayment(
        'user-1',
        TransactionProvider.PAWAPAY,
        10,
        TransactionCurrency.USD,
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toThrow('provider credentials are required in production');
  });

  it('logs Binance Pay generic provider webhooks once using provider and external event id', async () => {
    const { service, webhookLogRepository } = createPaymentService();

    const result = await service.handleProviderWebhook(
      TransactionProvider.BINANCE_PAY,
      {
        eventId: 'evt-1',
        eventType: 'payment:confirmed',
        externalRef: 'payment-1',
      },
      { 'x-test': 'true' },
    );

    expect(result).toMatchObject({
      provider: TransactionProvider.BINANCE_PAY,
      externalEventId: 'evt-1',
      duplicate: false,
      logId: 'saved-id',
    });
    expect(webhookLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: TransactionProvider.BINANCE_PAY,
        externalEventId: 'evt-1',
        externalRef: 'payment-1',
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
      TransactionProvider.PAWAPAY,
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
  });
});

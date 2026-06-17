import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '../src/common/enums';
import { PaymentWebhookLog } from '../src/modules/payment/entities/payment-webhook-log.entity';
import { Transaction } from '../src/modules/payment/entities/transaction.entity';
import { PaymentService } from '../src/modules/payment/payment.service';
import { BinancePayPaymentProviderStub } from '../src/modules/payment/providers/binance-pay-payment-provider.stub';
import { PawapayPaymentProviderStub } from '../src/modules/payment/providers/pawapay-payment-provider.stub';
import { PiPaymentProvider } from '../src/modules/payment/providers/pi-payment.provider';
import { User } from '../src/modules/user/entities/user.entity';

function repository<T extends object>() {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest
      .fn()
      .mockImplementation((input) =>
        Promise.resolve({ id: 'saved-id', ...input }),
      ),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    find: jest.fn().mockResolvedValue([]),
    increment: jest.fn().mockResolvedValue({ affected: 1 }),
  } as unknown as jest.Mocked<Repository<T>>;
}

function config(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function signPawapay(payload: unknown, timestamp: string, secret: string) {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${JSON.stringify(payload)}`)
    .digest('hex');
}

function signBinance(
  payload: unknown,
  timestamp: string,
  nonce: string,
  secret: string,
) {
  return createHmac('sha512', secret)
    .update(`${timestamp}\n${nonce}\n${JSON.stringify(payload)}\n`)
    .digest('hex')
    .toUpperCase();
}

describe('Payment provider e2e mocks', () => {
  const now = Date.now().toString();

  it('verifies valid Pi payment and rejects duplicates/mismatched wallets', async () => {
    const transactions = repository<Transaction>();
    const webhooks = repository<PaymentWebhookLog>();
    const users = repository<User>();
    users.findOne.mockResolvedValue({
      id: 'user-1',
      piWalletAddress: 'pi-wallet',
    } as User);
    const piProvider = {
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        amount: 1,
        raw: {},
      }),
    } as unknown as PiPaymentProvider;
    const service = new PaymentService(
      transactions,
      webhooks,
      users,
      piProvider,
      new PawapayPaymentProviderStub(config()),
      new BinancePayPaymentProviderStub(config()),
    );

    await expect(
      service.verifyAndCreditPiPayment(
        'user-1',
        'pi-1',
        TransactionType.SUBSCRIPTION,
      ),
    ).resolves.toMatchObject({ status: TransactionStatus.COMPLETED });

    transactions.findOne.mockResolvedValueOnce({
      id: 'tx-existing',
    } as Transaction);
    await expect(
      service.verifyAndCreditPiPayment(
        'user-1',
        'pi-1',
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toThrow('Transaction already processed');

    users.findOne.mockResolvedValueOnce({
      id: 'user-1',
      piWalletAddress: null,
    } as User);
    await expect(
      service.verifyAndCreditPiPayment(
        'user-1',
        'pi-2',
        TransactionType.SUBSCRIPTION,
      ),
    ).rejects.toThrow('Pi wallet must be linked');
  });

  it('creates Pawapay payments and validates webhook signature/replay behavior', async () => {
    const provider = new PawapayPaymentProviderStub(
      config({ nodeEnv: 'development' }),
    );
    await expect(
      provider.createPayment({
        userId: 'u1',
        amount: 10,
        currency: TransactionCurrency.USD,
        type: TransactionType.SUBSCRIPTION,
      }),
    ).resolves.toMatchObject({ provider: TransactionProvider.PAWAPAY });

    const payload = {
      eventId: 'evt-1',
      depositId: 'dep-1',
      status: 'COMPLETED',
    };
    await expect(provider.handleWebhook(payload, {})).resolves.toMatchObject({
      externalEventId: 'evt-1',
    });
    const signedProvider = new PawapayPaymentProviderStub(
      config({
        nodeEnv: 'production',
        'pawapay.apiKey': 'api-key',
        'pawapay.webhookSecret': 'pawapay-secret',
      }),
    );
    await expect(
      signedProvider.handleWebhook(payload, {
        'x-pawapay-timestamp': now,
        'x-pawapay-signature': 'bad',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    const stale = String(Date.now() - 10 * 60 * 1000);
    await expect(
      signedProvider.handleWebhook(payload, {
        'x-pawapay-timestamp': stale,
        'x-pawapay-signature': signPawapay(payload, stale, 'pawapay-secret'),
      }),
    ).rejects.toThrow('Stale Pawapay webhook');
  });

  it('creates Binance Pay orders and validates webhook signature/replay behavior', async () => {
    const provider = new BinancePayPaymentProviderStub(
      config({ nodeEnv: 'development' }),
    );
    await expect(
      provider.createOrder({
        userId: 'u1',
        amount: 10,
        currency: TransactionCurrency.USD,
        type: TransactionType.SUBSCRIPTION,
      }),
    ).resolves.toMatchObject({ provider: TransactionProvider.BINANCE_PAY });

    const nonce = 'nonce-1';
    const payload = {
      eventId: 'evt-1',
      externalRef: 'prepay-1',
      eventType: 'payment_completed',
    };
    await expect(provider.handleWebhook(payload, {})).resolves.toMatchObject({
      externalEventId: 'evt-1',
    });
    const signedProvider = new BinancePayPaymentProviderStub(
      config({
        nodeEnv: 'production',
        'binancePay.apiKey': 'api-key',
        'binancePay.secretKey': 'binance-secret',
      }),
    );
    await expect(
      signedProvider.handleWebhook(payload, {
        'binancepay-timestamp': now,
        'binancepay-nonce': nonce,
        'binancepay-signature': 'bad',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    const stale = String(Date.now() - 10 * 60 * 1000);
    await expect(
      signedProvider.handleWebhook(payload, {
        'binancepay-timestamp': stale,
        'binancepay-nonce': nonce,
        'binancepay-signature': signBinance(
          payload,
          stale,
          nonce,
          'binance-secret',
        ),
      }),
    ).rejects.toThrow('Stale Binance Pay webhook');
  });
});

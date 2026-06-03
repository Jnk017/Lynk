/* eslint-disable @typescript-eslint/no-require-imports */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');
import { Transaction } from './entities/transaction.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionType,
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
} from '../../common/enums';
import { PiPaymentProvider } from './providers/pi-payment.provider';
import {
  PaymentProvider,
  WebhookResult,
} from './providers/payment-provider.interface';
import { MonerooPaymentProviderStub } from './providers/moneroo-payment-provider.stub';
import { AvadaPayPaymentProviderStub } from './providers/avadapay-payment-provider.stub';
import { CoinbaseCommerceProviderStub } from './providers/coinbase-commerce-provider.stub';

@Injectable()
export class PaymentService {
  private stripe?: Stripe.Stripe;
  private readonly providers: Map<TransactionProvider, PaymentProvider>;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentWebhookLog)
    private webhookLogRepository: Repository<PaymentWebhookLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private dataSource: DataSource,
    private piPaymentProvider: PiPaymentProvider,
    private monerooPaymentProvider: MonerooPaymentProviderStub,
    private avadaPayPaymentProvider: AvadaPayPaymentProviderStub,
    private coinbaseCommerceProvider: CoinbaseCommerceProviderStub,
  ) {
    const stripeKey = this.configService.get<string>('stripe.secretKey');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey);
    }
    this.providers = new Map<TransactionProvider, PaymentProvider>([
      [TransactionProvider.PI_NETWORK, this.piPaymentProvider],
      [TransactionProvider.MONEROO, this.monerooPaymentProvider],
      [TransactionProvider.AVADAPAY, this.avadaPayPaymentProvider],
      [TransactionProvider.COINBASE_COMMERCE, this.coinbaseCommerceProvider],
    ]);
  }

  async createStripePaymentIntent(
    userId: string,
    amountCents: number,
    currency = 'usd',
    type: TransactionType,
  ) {
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: { userId, type },
    });

    await this.transactionRepository.save({
      userId,
      type,
      currency: TransactionCurrency.USD,
      amount: amountCents / 100,
      provider: TransactionProvider.STRIPE,
      status: TransactionStatus.PENDING,
      externalRef: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
    };
  }

  async createProviderPayment(
    userId: string,
    provider: TransactionProvider,
    amount: number,
    currency: TransactionCurrency,
    type: TransactionType,
    metadata: Record<string, unknown> = {},
  ) {
    this.assertValidAmount(amount);
    const paymentProvider = this.getPaymentProvider(provider);
    const result = await paymentProvider.createPayment({
      userId,
      amount,
      currency,
      type,
      metadata,
    });

    const transaction = await this.transactionRepository.save({
      userId,
      type,
      currency,
      amount,
      provider,
      status: TransactionStatus.PENDING,
      externalRef: result.externalRef,
      metadata: { ...(result.metadata || {}), checkoutUrl: result.checkoutUrl },
    });

    return { ...result, transactionId: transaction.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.stripe) return;

    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );
    if (!webhookSecret)
      throw new BadRequestException('Stripe webhook secret not configured');

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );

    const duplicate = await this.webhookLogRepository.findOne({
      where: {
        provider: TransactionProvider.STRIPE,
        externalEventId: event.id,
      },
    });
    if (duplicate) return;

    const log = await this.webhookLogRepository.save({
      provider: TransactionProvider.STRIPE,
      eventType: event.type,
      externalRef: this.getStripeObjectId(event.data.object),
      externalEventId: event.id,
      payload: event as unknown as Record<string, unknown>,
      processed: false,
    });

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string };
      await this.transactionRepository.update(
        { externalRef: intent.id },
        { status: TransactionStatus.COMPLETED },
      );
      await this.webhookLogRepository.update(log.id, {
        processed: true,
        externalRef: intent.id,
      });
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as { id: string };
      await this.transactionRepository.update(
        { externalRef: intent.id },
        { status: TransactionStatus.FAILED },
      );
      await this.webhookLogRepository.update(log.id, {
        processed: true,
        externalRef: intent.id,
      });
    }
  }

  async handleProviderWebhook(
    provider: TransactionProvider,
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<WebhookResult & { duplicate: boolean; logId?: string }> {
    const paymentProvider = this.getPaymentProvider(provider);
    const webhookResult = await paymentProvider.handleWebhook(payload, headers);
    const externalEventId =
      webhookResult.externalEventId || this.extractWebhookEventId(payload);

    if (externalEventId) {
      const duplicate = await this.webhookLogRepository.findOne({
        where: { provider, externalEventId },
      });
      if (duplicate) {
        return { ...webhookResult, duplicate: true, logId: duplicate.id };
      }
    }

    const log = await this.webhookLogRepository.save({
      provider,
      eventType: webhookResult.eventType,
      externalRef: webhookResult.externalRef,
      externalEventId,
      headers,
      payload: this.asRecord(payload),
      processed: webhookResult.processed,
    });

    return { ...webhookResult, duplicate: false, logId: log.id };
  }

  /**
   * Credits a Pi payment only after server-side verification with the Pi API.
   * The client never supplies the amount that will be credited.
   */
  private getStripeObjectId(object: unknown): string | undefined {
    if (!object || typeof object !== 'object' || !('id' in object)) {
      return undefined;
    }

    const { id } = object as { id?: unknown };
    return typeof id === 'string' ? id : undefined;
  }

  async verifyAndCreditPiPayment(
    userId: string,
    piPaymentId: string,
    type: TransactionType,
  ): Promise<Transaction> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.piWalletAddress) {
      throw new BadRequestException(
        'Pi wallet must be linked before verifying Pi payments',
      );
    }

    const existing = await this.transactionRepository.findOne({
      where: { externalRef: piPaymentId },
    });
    if (existing)
      throw new BadRequestException('Transaction already processed');

    const verification = await this.piPaymentProvider.verifyPayment({
      externalRef: piPaymentId,
      expectedUserId: user.piWalletAddress,
    });
    if (
      !verification.verified ||
      !verification.amount ||
      verification.amount <= 0
    ) {
      throw new BadRequestException(
        'Pi payment could not be verified server-side',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `SELECT pg_advisory_xact_lock(hashtext('lynk_payment_external_ref_' || $1))`,
        [piPaymentId],
      );

      const existingInTransaction = await queryRunner.manager.findOne(
        Transaction,
        { where: { externalRef: piPaymentId } },
      );
      if (existingInTransaction) {
        throw new BadRequestException('Transaction already processed');
      }

      await queryRunner.manager.increment(
        User,
        { id: userId },
        'piBalance',
        verification.amount,
      );

      const tx = await queryRunner.manager.save(Transaction, {
        userId,
        type,
        currency: TransactionCurrency.PI,
        amount: verification.amount,
        provider: TransactionProvider.PI_NETWORK,
        status: TransactionStatus.COMPLETED,
        externalRef: piPaymentId,
        metadata: { piVerification: verification.raw },
      });

      await queryRunner.commitTransaction();
      return tx;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCompletedTransactionForUse(
    userId: string,
    transactionId: string,
    type: TransactionType,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        userId,
        type,
        status: TransactionStatus.COMPLETED,
      },
    });

    if (!transaction)
      throw new NotFoundException('Completed payment transaction not found');
    if (transaction.metadata?.subscriptionActivatedAt) {
      throw new BadRequestException(
        'Payment transaction has already been consumed',
      );
    }

    return transaction;
  }

  async markTransactionConsumed(
    transactionId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction)
      throw new NotFoundException('Payment transaction not found');

    await this.transactionRepository.update(transactionId, {
      metadata: { ...(transaction.metadata || {}), ...metadata },
    });
  }

  private getPaymentProvider(provider: TransactionProvider): PaymentProvider {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new BadRequestException(
        `Payment provider ${provider} is not supported`,
      );
    }
    return paymentProvider;
  }

  private assertValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
  }

  private extractWebhookEventId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const data = payload as Record<string, unknown>;
    const id = data.eventId || data.id;
    return typeof id === 'string' ? id : undefined;
  }

  private asRecord(payload: unknown): Record<string, unknown> {
    return payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : { value: payload };
  }

  async getUserTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

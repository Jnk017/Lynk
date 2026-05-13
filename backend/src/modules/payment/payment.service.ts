import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib = require('stripe');
type StripeInstance = InstanceType<typeof StripeLib>;
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionType,
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
} from '../../common/enums';

@Injectable()
export class PaymentService {
  private stripe: StripeInstance;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    const stripeKey = this.configService.get<string>('stripe.secretKey');
    if (stripeKey) {
      this.stripe = new StripeLib(stripeKey);
    }
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

    // Pre-create pending transaction
    await this.transactionRepository.save({
      userId,
      type,
      currency: TransactionCurrency.USD,
      amount: amountCents / 100,
      provider: TransactionProvider.STRIPE,
      status: TransactionStatus.PENDING,
      externalRef: paymentIntent.id,
    });

    return { clientSecret: paymentIntent.client_secret, intentId: paymentIntent.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.stripe) return;

    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Record<string, string>;
      await this.transactionRepository.update(
        { externalRef: intent.id },
        { status: TransactionStatus.COMPLETED },
      );
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Record<string, string>;
      await this.transactionRepository.update(
        { externalRef: intent.id },
        { status: TransactionStatus.FAILED },
      );
    }
  }

  /**
   * Credit Pi balance after Pi Network payment verification.
   * The Pi payment must be verified via the Pi Network API before calling this.
   */
  async creditPiPayment(userId: string, piAmount: number, piTxId: string): Promise<Transaction> {
    const existing = await this.transactionRepository.findOne({
      where: { externalRef: piTxId },
    });
    if (existing) throw new BadRequestException('Transaction already processed');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.increment(User, { id: userId }, 'piBalance', piAmount);

      const tx = await queryRunner.manager.save(Transaction, {
        userId,
        type: TransactionType.SUBSCRIPTION,
        currency: TransactionCurrency.PI,
        amount: piAmount,
        provider: TransactionProvider.PI_NETWORK,
        status: TransactionStatus.COMPLETED,
        externalRef: piTxId,
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

  async getUserTransactions(userId: string, page = 1, limit = 20): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

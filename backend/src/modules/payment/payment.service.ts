import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '../../common/enums';
import { ObservabilityEventName } from '../observability/observability-events';
import { ObservabilityService } from '../observability/observability.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../user/entities/user.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { Transaction } from './entities/transaction.entity';
import { BinancePayPaymentProviderStub } from './providers/binance-pay-payment-provider.stub';
import {
  PaymentProvider,
  WebhookResult,
} from './providers/payment-provider.interface';
import { PawapayPaymentProviderStub } from './providers/pawapay-payment-provider.stub';
import { PiPaymentProvider } from './providers/pi-payment.provider';

@Injectable()
export class PaymentService {
  private readonly providers: Map<TransactionProvider, PaymentProvider>;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentWebhookLog)
    private webhookLogRepository: Repository<PaymentWebhookLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private piPaymentProvider: PiPaymentProvider,
    private pawapayPaymentProvider: PawapayPaymentProviderStub,
    private binancePayPaymentProvider: BinancePayPaymentProviderStub,
    @Optional()
    private observabilityService?: ObservabilityService,
    @Optional()
    private auditLogService?: AuditLogService,
  ) {
    this.providers = new Map<TransactionProvider, PaymentProvider>([
      [TransactionProvider.PI_NETWORK, this.piPaymentProvider],
      [TransactionProvider.PAWAPAY, this.pawapayPaymentProvider],
      [TransactionProvider.BINANCE_PAY, this.binancePayPaymentProvider],
    ]);
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
    void this.observabilityService?.track(
      ObservabilityEventName.PAYMENT_CREATED,
      userId,
      { transactionId: transaction.id, provider, amount, currency, type },
    );
    await this.auditLogService?.record({
      action: 'payment.created',
      actorUserId: userId,
      targetType: 'payment',
      targetId: transaction.id,
      metadata: {
        provider,
        amount,
        currency,
        type,
        externalRef: result.externalRef,
      },
    });
    return { ...result, transactionId: transaction.id };
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
        await this.auditLogService?.record({
          action: 'payment.webhook_duplicate_rejected',
          targetType: 'payment_webhook',
          targetId: duplicate.id,
          metadata: {
            provider,
            externalEventId,
            externalRef: webhookResult.externalRef,
          },
        });
        return { ...webhookResult, duplicate: true, logId: duplicate.id };
      }
    }
    await this.auditLogService?.record({
      action: 'payment.webhook_received',
      targetType: 'payment_webhook',
      targetId: externalEventId,
      metadata: {
        provider,
        externalRef: webhookResult.externalRef,
        eventType: webhookResult.eventType,
      },
    });
    await this.synchronizeTransactionFromWebhook(webhookResult);
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
    if (existing) {
      throw new BadRequestException('Transaction already processed');
    }
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
    await this.userRepository.increment(
      { id: userId },
      'piBalance',
      verification.amount,
    );
    return this.transactionRepository.save({
      userId,
      type,
      currency: TransactionCurrency.PI,
      amount: verification.amount,
      provider: TransactionProvider.PI_NETWORK,
      status: TransactionStatus.COMPLETED,
      externalRef: piPaymentId,
      metadata: { piVerification: verification.raw },
    });
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
    if (!transaction) {
      throw new NotFoundException('Completed payment transaction not found');
    }
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
    if (!transaction) {
      throw new NotFoundException('Payment transaction not found');
    }
    await this.transactionRepository.update(transactionId, {
      metadata: { ...(transaction.metadata || {}), ...metadata },
    });
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

  async transitionTransactionStatus(
    transactionId: string,
    nextStatus: TransactionStatus,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction)
      throw new NotFoundException('Payment transaction not found');
    this.assertValidStatusTransition(transaction.status, nextStatus);
    transaction.status = nextStatus;
    return this.transactionRepository.save(transaction);
  }

  private async synchronizeTransactionFromWebhook(
    webhookResult: WebhookResult,
  ): Promise<void> {
    if (!webhookResult.externalRef) return;
    const transaction = await this.transactionRepository.findOne({
      where: { externalRef: webhookResult.externalRef },
    });
    if (!transaction) return;
    const eventType = (webhookResult.eventType || '').toLowerCase();
    let nextStatus: TransactionStatus | undefined;
    if (eventType.includes('fail') || eventType.includes('reject'))
      nextStatus = TransactionStatus.FAILED;
    else if (eventType.includes('expire'))
      nextStatus = TransactionStatus.EXPIRED;
    else if (
      eventType.includes('complete') ||
      eventType.includes('success') ||
      eventType.includes('paid')
    )
      nextStatus = TransactionStatus.COMPLETED;
    else if (webhookResult.processed) nextStatus = TransactionStatus.PROCESSING;
    if (
      nextStatus &&
      this.isValidStatusTransition(transaction.status, nextStatus)
    ) {
      transaction.status = nextStatus;
      transaction.metadata = {
        ...(transaction.metadata || {}),
        lastWebhookEventType: webhookResult.eventType,
      };
      await this.transactionRepository.save(transaction);
      await this.auditLogService?.record({
        action: `payment.${nextStatus}`,
        actorUserId: transaction.userId,
        targetType: 'payment',
        targetId: transaction.id,
        metadata: {
          externalRef: transaction.externalRef,
          provider: transaction.provider,
          eventType: webhookResult.eventType,
        },
      });
    }
  }

  private assertValidStatusTransition(
    currentStatus: TransactionStatus,
    nextStatus: TransactionStatus,
  ): void {
    if (!this.isValidStatusTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(
        `Invalid payment status transition from ${currentStatus} to ${nextStatus}`,
      );
    }
  }

  private isValidStatusTransition(
    currentStatus: TransactionStatus,
    nextStatus: TransactionStatus,
  ): boolean {
    if (currentStatus === nextStatus) return true;
    const allowed: Record<TransactionStatus, TransactionStatus[]> = {
      [TransactionStatus.PENDING]: [
        TransactionStatus.PROCESSING,
        TransactionStatus.FAILED,
        TransactionStatus.EXPIRED,
      ],
      [TransactionStatus.PROCESSING]: [TransactionStatus.COMPLETED],
      [TransactionStatus.COMPLETED]: [],
      [TransactionStatus.FAILED]: [],
      [TransactionStatus.EXPIRED]: [],
    };
    return allowed[currentStatus]?.includes(nextStatus) || false;
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
}

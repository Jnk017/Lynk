import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionProvider } from '../../../common/enums';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from './payment-provider.interface';

interface StubWebhookPayload {
  id?: string;
  eventId?: string;
  eventType?: string;
  externalRef?: string;
  amount?: number;
}

@Injectable()
export abstract class TestModePaymentProviderStub implements PaymentProvider {
  protected constructor(
    protected readonly configService: ConfigService,
    private readonly provider: TransactionProvider,
  ) {}

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    this.assertTestMode();
    this.assertValidAmount(input.amount);

    return Promise.resolve({
      provider: this.provider,
      externalRef: `test_${this.provider}_${input.userId}_${Date.now()}`,
      checkoutUrl: `https://payments.test.local/${this.provider}/checkout`,
      metadata: {
        ...(input.metadata || {}),
        testMode: true,
        provider: this.provider,
      },
    });
  }

  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    this.assertTestMode();
    return Promise.resolve({
      verified: false,
      externalRef: input.externalRef,
      raw: {
        testMode: true,
        provider: this.provider,
        reason: 'Provider stub does not verify real external payments',
      },
    });
  }

  handleWebhook(payload: unknown): Promise<WebhookResult> {
    this.assertTestMode();
    const data = this.asStubWebhookPayload(payload);
    return Promise.resolve({
      provider: this.provider,
      externalRef: data.externalRef,
      externalEventId: data.eventId || data.id,
      processed: false,
      eventType: data.eventType || `${this.provider}.stub_webhook`,
    });
  }

  private assertTestMode(): void {
    const nodeEnv = this.configService.get<string>('nodeEnv') || 'development';
    if (nodeEnv === 'production') {
      throw new BadRequestException(
        `${this.provider} provider stub is disabled in production`,
      );
    }
  }

  private assertValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
  }

  private asStubWebhookPayload(payload: unknown): StubWebhookPayload {
    return typeof payload === 'object' && payload !== null ? payload : {};
  }
}

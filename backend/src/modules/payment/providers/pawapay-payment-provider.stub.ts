import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { TransactionProvider } from '../../../common/enums';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from './payment-provider.interface';

@Injectable()
export class PawapayPaymentProviderStub implements PaymentProvider {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('pawapay.baseUrl'),
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('pawapay.apiKey') || ''}`,
      },
    });
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    this.assertValidCreatePayment(input);
    if (
      (this.configService.get<string>('nodeEnv') || 'development') ===
        'production' &&
      !this.configService.get<string>('pawapay.apiKey')
    ) {
      throw new BadRequestException(
        'pawapay provider credentials are required in production',
      );
    }
    if (this.isTestMode()) {
      const externalRef = `test_${TransactionProvider.PAWAPAY}_${input.userId}_${Date.now()}`;
      return {
        provider: TransactionProvider.PAWAPAY,
        externalRef,
        checkoutUrl: 'https://payments.test.local/pawapay/checkout',
        metadata: { testMode: true, provider: TransactionProvider.PAWAPAY },
      };
    }
    const idempotencyKey = this.asString(
      input.metadata?.idempotencyKey,
      randomUUID(),
    );
    const correlationId = this.asString(
      input.metadata?.correlationId,
      randomUUID(),
    );
    const payload = {
      depositId: correlationId,
      amount: String(input.amount),
      currency: input.currency.toUpperCase(),
      correspondent: input.metadata?.correspondent,
      payer: input.metadata?.payer,
      customerTimestamp: new Date().toISOString(),
      statementDescription: input.type,
      metadata: { userId: input.userId, type: input.type },
    };
    const response = await this.client.post('/deposits', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
        'X-Correlation-ID': correlationId,
      },
    });
    const data = response.data as Record<string, unknown>;
    return {
      provider: TransactionProvider.PAWAPAY,
      externalRef: this.asString(data.depositId || data.id, correlationId),
      checkoutUrl:
        typeof data.redirectUrl === 'string' ? data.redirectUrl : undefined,
      metadata: {
        provider: TransactionProvider.PAWAPAY,
        idempotencyKey,
        correlationId,
        raw: data,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!input.externalRef)
      throw new BadRequestException('externalRef is required');
    const response = await this.client.get(
      `/deposits/${encodeURIComponent(input.externalRef)}`,
    );
    const data = response.data as Record<string, unknown>;
    const status = this.asString(data.status).toUpperCase();
    const amount = Number(data.amount);
    const verified =
      ['COMPLETED', 'ACCEPTED', 'SUCCESSFUL'].includes(status) &&
      (!input.expectedAmount || amount === input.expectedAmount);
    return { verified, externalRef: input.externalRef, amount, raw: data };
  }

  verifyWebhookSignature(
    payload: unknown,
    headers: Record<string, string>,
  ): boolean {
    const secret =
      this.configService.get<string>('pawapay.webhookSecret') || '';
    if (!secret && this.isTestMode()) return true;
    if (!secret)
      throw new BadRequestException('Pawapay webhook secret is not configured');
    const signature =
      headers['x-pawapay-signature'] || headers['pawapay-signature'];
    const timestamp = headers['x-pawapay-timestamp'];
    if (!signature || !timestamp)
      throw new BadRequestException('Missing Pawapay webhook signature');
    if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000)
      throw new BadRequestException('Stale Pawapay webhook');
    const body =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  }

  async handleWebhook(
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<WebhookResult> {
    await Promise.resolve();
    if (!this.verifyWebhookSignature(payload, headers))
      throw new BadRequestException('Invalid Pawapay webhook signature');
    const data = this.asRecord(payload);
    return Promise.resolve({
      provider: TransactionProvider.PAWAPAY,
      externalRef: this.asString(data.depositId || data.externalRef),
      externalEventId: this.asString(data.eventId || data.id || data.depositId),
      processed: true,
      eventType: this.asString(
        data.eventType || data.status,
        'pawapay.webhook',
      ),
    });
  }

  private isTestMode(): boolean {
    const nodeEnv = this.configService.get<string>('nodeEnv') || 'development';
    return (
      nodeEnv !== 'production' &&
      !this.configService.get<string>('pawapay.apiKey')
    );
  }

  private assertValidCreatePayment(input: CreatePaymentInput): void {
    if (!input.userId) throw new BadRequestException('userId is required');
    if (!Number.isFinite(input.amount) || input.amount <= 0)
      throw new BadRequestException('Payment amount must be greater than zero');
    if (!input.currency) throw new BadRequestException('currency is required');
  }

  private asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : fallback;
  }

  private asRecord(payload: unknown): Record<string, unknown> {
    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  }
}

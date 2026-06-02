import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  TransactionCurrency,
  TransactionProvider,
} from '../../../common/enums';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from './payment-provider.interface';

interface PiPaymentResponse {
  identifier?: string;
  user_uid?: string;
  amount?: number | string;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    completed?: boolean;
    cancelled?: boolean;
  };
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PiPaymentProvider implements PaymentProvider {
  constructor(private readonly configService: ConfigService) {}

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      provider: TransactionProvider.PI_NETWORK,
      externalRef: `pi_pending_${input.userId}_${Date.now()}`,
      metadata: input.metadata,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const apiKey = this.configService.get<string>('pi.apiKey');
    const baseUrl =
      this.configService.get<string>('pi.apiBaseUrl') ||
      'https://api.minepi.com/v2';

    if (!apiKey) {
      throw new BadRequestException(
        'Pi payment verification is not configured',
      );
    }

    const response = await axios.get<PiPaymentResponse>(
      `${baseUrl}/payments/${input.externalRef}`,
      {
        headers: { Authorization: `Key ${apiKey}` },
      },
    );

    const payment = response.data;
    const amount = Number(payment.amount || 0);
    const verified = Boolean(
      payment.status?.developer_approved &&
      payment.status?.transaction_verified &&
      payment.status?.completed &&
      !payment.status?.cancelled,
    );

    const matchesAmount =
      input.expectedAmount === undefined ||
      Math.abs(amount - input.expectedAmount) < 0.000001;
    const matchesUser =
      !input.expectedUserId || payment.user_uid === input.expectedUserId;

    return {
      verified: verified && matchesAmount && matchesUser,
      externalRef: input.externalRef,
      amount,
      currency: TransactionCurrency.PI,
      userId: payment.user_uid,
      raw: payment,
    };
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const data = payload as PiPaymentResponse;
    return {
      provider: TransactionProvider.PI_NETWORK,
      externalRef: data.identifier,
      processed: false,
      eventType: 'pi.payment.webhook_unimplemented',
    };
  }
}

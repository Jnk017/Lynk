import {
  TransactionCurrency,
  TransactionProvider,
  TransactionType,
} from '../../../common/enums';

export interface CreatePaymentInput {
  userId: string;
  amount: number;
  currency: TransactionCurrency;
  type: TransactionType;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResult {
  provider: TransactionProvider;
  externalRef: string;
  checkoutUrl?: string;
  clientSecret?: string | null;
  metadata?: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  externalRef: string;
  expectedUserId?: string;
  expectedAmount?: number;
  expectedCurrency?: TransactionCurrency;
}

export interface VerifyPaymentResult {
  verified: boolean;
  externalRef: string;
  amount?: number;
  currency?: TransactionCurrency;
  userId?: string;
  raw?: unknown;
}

export interface WebhookResult {
  provider: TransactionProvider;
  externalRef?: string;
  externalEventId?: string;
  processed: boolean;
  eventType?: string;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  handleWebhook(
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<WebhookResult>;
}

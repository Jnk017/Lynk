import { api } from './api';
import { PaymentTransactionSummary } from './paymentStatus';

export type PaymentBusinessEventType =
  | 'premium.activation_requested'
  | 'boost.activation_requested'
  | 'gift.delivery_requested'
  | 'wallet.ledger_credit_requested'
  | 'staking.creation_requested'
  | 'marriage_commitment.creation_requested'
  | 'revenue_pool.contribution_requested';

export interface PaymentBusinessEventPayload {
  transaction: PaymentTransactionSummary;
  eventType: PaymentBusinessEventType;
  metadata?: Record<string, unknown>;
}

const EVENT_ENDPOINT = '/payment/business-events';

export async function emitPaymentBusinessEvent(
  payload: PaymentBusinessEventPayload,
): Promise<void> {
  await api.post(EVENT_ENDPOINT, payload);
}

export async function emitPremiumActivationEvent(
  transaction: PaymentTransactionSummary,
): Promise<void> {
  await emitPaymentBusinessEvent({
    eventType: 'premium.activation_requested',
    transaction,
  });
}

import { APP_CHANNEL } from '../constants/channel';
import { trackFrontendEvent } from './observability';

interface PaymentTelemetryInput {
  provider?: string;
  reference?: string;
  status?: string;
  type?: string;
  amount?: string | number;
}

function safeReference(reference?: string): string | undefined {
  if (!reference) return undefined;
  return reference.length <= 12
    ? reference
    : `${reference.slice(0, 6)}...${reference.slice(-4)}`;
}

export async function trackPaymentTelemetry(
  event:
    | 'payment_checkout_opened'
    | 'payment_pending_viewed'
    | 'payment_success_viewed'
    | 'payment_failed_viewed'
    | 'wallet_history_viewed',
  input: PaymentTelemetryInput = {},
): Promise<void> {
  await trackFrontendEvent(event, 'payment-flow', {
    channel: APP_CHANNEL,
    provider: input.provider,
    reference: safeReference(input.reference),
    status: input.status,
    type: input.type,
    amount: typeof input.amount === 'number' ? input.amount : input.amount,
  });
}

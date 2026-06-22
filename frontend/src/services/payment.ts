import { API_ENDPOINTS } from '../constants/api';
import { APP_CHANNEL, assertPaymentProviderAllowed, PaymentProvider } from '../constants/payments';
import { api } from './api';

type PaymentCurrency = 'usd' | 'eur' | 'xof' | 'pi';
type PaymentType = 'subscription' | 'gift' | 'boost' | 'staking' | 'refund';

export interface CreateProviderPaymentInput {
  provider: PaymentProvider;
  amount: number;
  currency: PaymentCurrency;
  type: PaymentType;
  metadata?: Record<string, unknown>;
}

export interface ProviderPaymentResult {
  provider: PaymentProvider;
  externalRef: string;
  checkoutUrl?: string;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}

export async function createGlobalProviderPayment(
  input: CreateProviderPaymentInput,
): Promise<ProviderPaymentResult> {
  assertPaymentProviderAllowed(input.provider, 'global');
  return api.post<ProviderPaymentResult>(
    API_ENDPOINTS.payment.providerCreate(input.provider),
    {
      amount: input.amount,
      currency: input.currency,
      type: input.type,
      metadata: input.metadata,
    },
  );
}

export async function createChannelProviderPayment(
  input: CreateProviderPaymentInput,
): Promise<ProviderPaymentResult> {
  assertPaymentProviderAllowed(input.provider, APP_CHANNEL);
  if (APP_CHANNEL === 'pi') {
    throw new Error('Use the Pi SDK payment flow for Pi frontend payments');
  }
  return createGlobalProviderPayment(input);
}

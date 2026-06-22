import { API_ENDPOINTS } from '../constants/api';
import {
  APP_CHANNEL,
  assertPaymentProviderAllowed,
  PaymentProvider,
} from '../constants/payments';
import { api } from './api';
import { assertPiRuntimeAvailable } from './piRuntime';

type PaymentCurrency = 'usd' | 'eur' | 'xof' | 'pi';
type PaymentType = 'subscription' | 'gift' | 'boost' | 'staking' | 'refund';

type PiCreatePayment = (
  details: {
    amount: number;
    memo: string;
    metadata?: Record<string, unknown>;
  },
  callbacks: {
    onReadyForServerApproval: (identifier: string) => void;
    onReadyForServerCompletion: (identifier: string, txid: string) => void;
    onCancel: (identifier: string) => void;
    onError: (error: Error) => void;
  },
) => void;

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

export function createPiSdkPayment(input: {
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
}): Promise<{ identifier: string; txid?: string }> {
  assertPaymentProviderAllowed('pi_network', 'pi');

  const pi = assertPiRuntimeAvailable();
  if (typeof pi.createPayment !== 'function') {
    throw new Error('Pi SDK createPayment is not available');
  }

  const createPayment = pi.createPayment as PiCreatePayment;

  return new Promise((resolve, reject) => {
    createPayment(
      {
        amount: input.amount,
        memo: input.memo,
        metadata: input.metadata,
      },
      {
        onReadyForServerApproval: () => undefined,
        onReadyForServerCompletion: (identifier, txid) => {
          resolve({ identifier, txid });
        },
        onCancel: (identifier) => {
          reject(new Error(`Pi payment ${identifier} was cancelled`));
        },
        onError: (error) => {
          reject(error);
        },
      },
    );
  });
}

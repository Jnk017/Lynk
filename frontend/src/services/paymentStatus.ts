import { API_ENDPOINTS } from '../constants/api';
import { api } from './api';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'unknown';

export interface PaymentTransactionSummary {
  id: string;
  externalRef?: string;
  provider?: string;
  status?: string;
  type?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
}

function normalizeStatus(status?: string): PaymentStatus {
  const normalized = status?.toLowerCase();
  if (normalized === 'completed' || normalized === 'success' || normalized === 'paid') {
    return 'completed';
  }
  if (normalized === 'failed' || normalized === 'error') {
    return 'failed';
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'cancelled';
  }
  if (normalized === 'pending' || normalized === 'processing') {
    return 'pending';
  }
  return 'unknown';
}

export async function getPaymentStatusByReference(
  reference?: string,
): Promise<{ status: PaymentStatus; transaction?: PaymentTransactionSummary }> {
  if (!reference) {
    return { status: 'unknown' };
  }

  const transactions = await api.get<PaymentTransactionSummary[]>(
    API_ENDPOINTS.payment.transactions,
  );
  const transaction = transactions.find(
    (item) => item.externalRef === reference || item.id === reference,
  );

  if (!transaction) {
    return { status: 'pending' };
  }

  return {
    status: normalizeStatus(transaction.status),
    transaction,
  };
}

import { QueryClient } from '@tanstack/react-query';
import { PaymentTransactionSummary } from './paymentStatus';

export type PaymentReconciliationDomain =
  | 'wallet'
  | 'subscription'
  | 'profile'
  | 'founder'
  | 'payment';

export function getPaymentReconciliationDomains(
  transaction?: PaymentTransactionSummary,
): PaymentReconciliationDomain[] {
  const type = transaction?.type?.toLowerCase();
  const domains: PaymentReconciliationDomain[] = ['payment', 'wallet', 'profile'];

  if (type === 'subscription') {
    domains.push('subscription');
  }

  if (type === 'boost' || type === 'gift' || type === 'staking') {
    domains.push('profile');
  }

  if (type === 'subscription' || type === 'gift' || type === 'boost') {
    domains.push('founder');
  }

  return Array.from(new Set(domains));
}

export async function reconcilePaymentSuccess(
  queryClient: QueryClient,
  transaction?: PaymentTransactionSummary,
): Promise<void> {
  const domains = getPaymentReconciliationDomains(transaction);

  await Promise.all(
    domains.map((domain) => {
      if (domain === 'payment') {
        return queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
      }
      if (domain === 'wallet') {
        return queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }
      if (domain === 'subscription') {
        return queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
      if (domain === 'founder') {
        return queryClient.invalidateQueries({ queryKey: ['founder'] });
      }
      return queryClient.invalidateQueries({ queryKey: ['profile'] });
    }),
  );
}

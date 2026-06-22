import { getPaymentReconciliationDomains } from './paymentReconciliation';

describe('payment reconciliation domains', () => {
  it('refreshes payment, wallet and profile for wallet cash-in', () => {
    expect(
      getPaymentReconciliationDomains({ id: 'tx-1', type: 'wallet' }),
    ).toEqual(['payment', 'wallet', 'profile']);
  });

  it('refreshes subscription and founder state for subscription payments', () => {
    expect(
      getPaymentReconciliationDomains({ id: 'tx-2', type: 'subscription' }),
    ).toEqual(['payment', 'wallet', 'profile', 'subscription', 'founder']);
  });
});

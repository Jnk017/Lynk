import { getPaymentReconciliationDomains } from './paymentReconciliation';

describe('payment reconciliation domains', () => {
  it('refreshes payment, wallet and profile for wallet cash-in', () => {
    expect(
      getPaymentReconciliationDomains({ id: 'tx-1', type: 'wallet' }),
    ).toEqual(['payment', 'wallet', 'profile']);
  });
});

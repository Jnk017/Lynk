import { ADMIN_PAYMENT_MONITORING_SIGNALS } from './payment-monitoring.matrix';

describe('admin payment monitoring matrix', () => {
  it('covers transaction, provider, wallet and risk signals', () => {
    expect(
      ADMIN_PAYMENT_MONITORING_SIGNALS.map((signal) => signal.category),
    ).toEqual(expect.arrayContaining(['transaction', 'provider', 'wallet', 'risk']));
  });

  it('includes critical alerts for wallet mismatch and duplicate payment references', () => {
    const criticalSignals = ADMIN_PAYMENT_MONITORING_SIGNALS.filter(
      (signal) => signal.severity === 'critical',
    ).map((signal) => signal.id);

    expect(criticalSignals).toEqual(
      expect.arrayContaining([
        'wallet-balance-mismatch',
        'duplicate-payment-reference',
      ]),
    );
  });
});

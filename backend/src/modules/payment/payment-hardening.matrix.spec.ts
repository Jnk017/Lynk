import { PAYMENT_HARDENING_CONTROLS } from './payment-hardening.matrix';

describe('payment production hardening matrix', () => {
  it('covers all required production hardening categories', () => {
    expect(PAYMENT_HARDENING_CONTROLS.map((control) => control.category)).toEqual(
      expect.arrayContaining([
        'circuit-breaker',
        'replay-protection',
        'provider-outage',
        'distributed-lock',
        'reconciliation',
        'audit',
      ]),
    );
  });

  it('marks all production hardening controls as required', () => {
    expect(PAYMENT_HARDENING_CONTROLS.every((control) => control.severity === 'required')).toBe(true);
  });
});

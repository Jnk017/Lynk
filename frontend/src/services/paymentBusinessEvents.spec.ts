import { emitPremiumActivationEvent } from './paymentBusinessEvents';

describe('payment business events', () => {
  it('exports premium activation event helper', () => {
    expect(typeof emitPremiumActivationEvent).toBe('function');
  });
});

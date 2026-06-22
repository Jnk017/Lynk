export type PaymentRecoveryScenario = {
  id: string;
  trigger: string;
  expectedRecovery: string;
};

export const PAYMENT_RECOVERY_SCENARIOS: PaymentRecoveryScenario[] = [
  {
    id: 'interrupted-checkout-resume',
    trigger: 'user leaves checkout after provider handoff',
    expectedRecovery: 'pending screen can resume backend status polling by reference',
  },
  {
    id: 'network-loss-retry',
    trigger: 'network loss during status refresh',
    expectedRecovery: 'retry action re-fetches backend transaction state without creating a new payment',
  },
  {
    id: 'delayed-confirmation',
    trigger: 'provider confirmation arrives after user returns to app',
    expectedRecovery: 'pending screen keeps polling until backend reports completed or failed',
  },
  {
    id: 'duplicate-tap-guard',
    trigger: 'user taps checkout multiple times',
    expectedRecovery: 'single-flight guard allows only one provider initialization',
  },
];

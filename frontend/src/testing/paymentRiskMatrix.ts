export type PaymentRiskScenario = {
  id: string;
  risk: string;
  expectedControl: string;
};

export const PAYMENT_RISK_SCENARIOS: PaymentRiskScenario[] = [
  {
    id: 'velocity-checks',
    risk: 'too many payment attempts in a short window',
    expectedControl: 'backend risk layer can flag repeated attempts and frontend remains recoverable',
  },
  {
    id: 'anti-abuse-provider-switching',
    risk: 'rapid provider switching to bypass failed states',
    expectedControl: 'channel rules still restrict providers and payment status remains reference-based',
  },
  {
    id: 'anti-double-payment',
    risk: 'same checkout intent paid or initialized twice',
    expectedControl: 'single-flight guard and backend idempotency prevent duplicate entitlement creation',
  },
  {
    id: 'admin-alerts',
    risk: 'suspicious or inconsistent payment state',
    expectedControl: 'admin audit and observability event streams can surface the issue for review',
  },
];

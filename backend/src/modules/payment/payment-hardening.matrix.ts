export type PaymentHardeningControl = {
  id: string;
  category:
    | 'circuit-breaker'
    | 'replay-protection'
    | 'provider-outage'
    | 'distributed-lock'
    | 'reconciliation'
    | 'audit';
  severity: 'required' | 'recommended';
  description: string;
};

export const PAYMENT_HARDENING_CONTROLS = [
  {
    id: 'provider-circuit-breaker',
    category: 'circuit-breaker',
    severity: 'required',
    description: 'Disable provider initiation after repeated provider failures.',
  },
  {
    id: 'payment-replay-protection',
    category: 'replay-protection',
    severity: 'required',
    description: 'Reject duplicate webhook or callback processing by event key.',
  },
  {
    id: 'provider-outage-fallback',
    category: 'provider-outage',
    severity: 'required',
    description: 'Keep payments recoverable when provider status is degraded.',
  },
  {
    id: 'transaction-distributed-lock',
    category: 'distributed-lock',
    severity: 'required',
    description: 'Lock payment consumption by transaction reference.',
  },
  {
    id: 'scheduled-reconciliation',
    category: 'reconciliation',
    severity: 'required',
    description: 'Reconcile pending and inconsistent transactions on a schedule.',
  },
  {
    id: 'complete-audit-trail',
    category: 'audit',
    severity: 'required',
    description: 'Record provider, transaction and admin state transitions.',
  },
] satisfies PaymentHardeningControl[];

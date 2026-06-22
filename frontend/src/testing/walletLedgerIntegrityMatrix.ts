export type WalletLedgerIntegrityScenario = {
  id: string;
  invariant: string;
  expectedControl: string;
};

export const WALLET_LEDGER_INTEGRITY_SCENARIOS: WalletLedgerIntegrityScenario[] = [
  {
    id: 'credit-confirmed-cash-in-once',
    invariant: 'confirmed cash-in credits wallet once',
    expectedControl: 'transaction reference is consumed only once and visible balance refreshes from backend',
  },
  {
    id: 'debit-authorized-spend-once',
    invariant: 'authorized wallet spend debits once',
    expectedControl: 'debit is linked to the original payment intent and cannot be replayed',
  },
  {
    id: 'negative-balance-blocked',
    invariant: 'wallet balance cannot become negative',
    expectedControl: 'backend reconciliation detects insufficient or inconsistent balance state',
  },
  {
    id: 'automatic-reconciliation',
    invariant: 'visible balance equals backend transaction state',
    expectedControl: 'frontend invalidates wallet and payment transaction caches after status changes',
  },
];

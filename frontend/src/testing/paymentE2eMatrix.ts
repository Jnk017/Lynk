export type PaymentE2eScenario = {
  id: string;
  channel: 'global' | 'pi';
  provider: 'pawapay' | 'binance_pay' | 'pi_sdk';
  flow: string;
  expectedOutcome: string;
};

export const PAYMENT_E2E_SCENARIOS: PaymentE2eScenario[] = [
  {
    id: 'global-pawapay-wallet-funding',
    channel: 'global',
    provider: 'pawapay',
    flow: 'wallet funding',
    expectedOutcome: 'wallet balance refreshes after confirmed transaction',
  },
  {
    id: 'global-binance-premium-activation',
    channel: 'global',
    provider: 'binance_pay',
    flow: 'premium activation',
    expectedOutcome: 'subscription and profile state refresh after confirmation',
  },
  {
    id: 'pi-sdk-wallet-funding',
    channel: 'pi',
    provider: 'pi_sdk',
    flow: 'wallet funding',
    expectedOutcome: 'Pi payment enters pending then reconciles from backend status',
  },
  {
    id: 'pi-sdk-premium-activation',
    channel: 'pi',
    provider: 'pi_sdk',
    flow: 'premium activation',
    expectedOutcome: 'Pi subscription confirmation refreshes premium state',
  },
  {
    id: 'global-pawapay-gift-delivery',
    channel: 'global',
    provider: 'pawapay',
    flow: 'gifts',
    expectedOutcome: 'gift business event is recorded once after confirmation',
  },
  {
    id: 'global-binance-founder-purchase',
    channel: 'global',
    provider: 'binance_pay',
    flow: 'founder purchase',
    expectedOutcome: 'founder state and revenue eligibility refresh after confirmation',
  },
  {
    id: 'pi-sdk-staking',
    channel: 'pi',
    provider: 'pi_sdk',
    flow: 'staking',
    expectedOutcome: 'staking commitment is reconciled from backend status',
  },
  {
    id: 'pi-sdk-marriage-commitment',
    channel: 'pi',
    provider: 'pi_sdk',
    flow: 'marriage commitment',
    expectedOutcome: 'relationship commitment state refreshes after confirmation',
  },
];

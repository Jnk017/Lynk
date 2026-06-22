import { PAYMENT_E2E_SCENARIOS } from './paymentE2eMatrix';
import { PAYMENT_RECOVERY_SCENARIOS } from './paymentRecoveryMatrix';
import { PAYMENT_RISK_SCENARIOS } from './paymentRiskMatrix';
import { WALLET_LEDGER_INTEGRITY_SCENARIOS } from './walletLedgerIntegrityMatrix';

describe('PR62 payment E2E coverage matrices', () => {
  it('covers Global and Pi payment providers', () => {
    expect(PAYMENT_E2E_SCENARIOS.map((scenario) => scenario.provider)).toEqual(
      expect.arrayContaining(['pawapay', 'binance_pay', 'pi_sdk']),
    );
  });

  it('covers key payment business flows', () => {
    expect(PAYMENT_E2E_SCENARIOS.map((scenario) => scenario.flow)).toEqual(
      expect.arrayContaining([
        'wallet funding',
        'premium activation',
        'gifts',
        'founder purchase',
        'staking',
        'marriage commitment',
      ]),
    );
  });

  it('covers retry and recovery controls', () => {
    expect(PAYMENT_RECOVERY_SCENARIOS).toHaveLength(4);
  });

  it('covers wallet ledger integrity controls', () => {
    expect(WALLET_LEDGER_INTEGRITY_SCENARIOS).toHaveLength(4);
  });

  it('covers fraud and risk controls', () => {
    expect(PAYMENT_RISK_SCENARIOS).toHaveLength(4);
  });
});

import { TransactionProvider } from '../../../common/enums';
import {
  PROVIDER_ADAPTER_CAPABILITIES,
  PROVIDER_CREDENTIAL_REQUIREMENTS,
  PROVIDER_SANDBOX_CONTRACTS,
} from './provider-sandbox.contracts';

describe('provider sandbox contracts', () => {
  it('declares contracts for PawaPay, Binance Pay and Pi Network', () => {
    expect(PROVIDER_SANDBOX_CONTRACTS.map((item) => item.provider)).toEqual(
      expect.arrayContaining([
        TransactionProvider.PAWAPAY,
        TransactionProvider.BINANCE_PAY,
        TransactionProvider.PI_NETWORK,
      ]),
    );
  });

  it('declares required production credentials for each provider', () => {
    expect(PROVIDER_CREDENTIAL_REQUIREMENTS).toHaveLength(3);
    for (const requirement of PROVIDER_CREDENTIAL_REQUIREMENTS) {
      expect(requirement.requiredInProduction.length).toBeGreaterThan(0);
      expect(requirement.callbackRequirements.length).toBeGreaterThan(0);
    }
  });

  it('declares adapter capabilities for each provider', () => {
    expect(PROVIDER_ADAPTER_CAPABILITIES).toHaveLength(3);
    for (const capability of PROVIDER_ADAPTER_CAPABILITIES) {
      expect(capability.supportsWebhook).toBe(true);
      expect(capability.supportsServerVerification).toBe(true);
      expect(capability.supportedCurrencies.length).toBeGreaterThan(0);
      expect(capability.supportedTypes.length).toBeGreaterThan(0);
    }
  });
});

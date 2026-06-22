import {
  TransactionCurrency,
  TransactionProvider,
  TransactionType,
} from '../../../common/enums';

export type ProviderEnvironment = 'sandbox' | 'production';

export interface ProviderAdapterCapabilities {
  provider: TransactionProvider;
  environment: ProviderEnvironment;
  supportsHostedCheckout: boolean;
  supportsWebhook: boolean;
  supportsServerVerification: boolean;
  supportedCurrencies: TransactionCurrency[];
  supportedTypes: TransactionType[];
}

export interface ProviderCredentialRequirements {
  provider: TransactionProvider;
  requiredInProduction: string[];
  optionalInSandbox: string[];
  callbackRequirements: string[];
}

export interface ProviderSandboxContract {
  provider: TransactionProvider;
  sandboxExternalRefPrefix: string;
  pendingStatus: string;
  successStatus: string;
  failedStatus: string;
  webhookEventIdField: string;
  paymentReferenceField: string;
}

import {
  TransactionCurrency,
  TransactionProvider,
  TransactionType,
} from '../../../common/enums';
import {
  ProviderAdapterCapabilities,
  ProviderCredentialRequirements,
  ProviderSandboxContract,
} from './provider-adapter.contract';

const supportedTypes = [
  TransactionType.SUBSCRIPTION,
  TransactionType.GIFT,
  TransactionType.BOOST,
  TransactionType.STAKING,
  TransactionType.REFUND,
];

export const PROVIDER_ADAPTER_CAPABILITIES: ProviderAdapterCapabilities[] = [
  {
    provider: TransactionProvider.PAWAPAY,
    environment: 'sandbox',
    supportsHostedCheckout: true,
    supportsWebhook: true,
    supportsServerVerification: true,
    supportedCurrencies: [TransactionCurrency.USD],
    supportedTypes,
  },
  {
    provider: TransactionProvider.BINANCE_PAY,
    environment: 'sandbox',
    supportsHostedCheckout: true,
    supportsWebhook: true,
    supportsServerVerification: true,
    supportedCurrencies: [TransactionCurrency.USD],
    supportedTypes,
  },
  {
    provider: TransactionProvider.PI_NETWORK,
    environment: 'sandbox',
    supportsHostedCheckout: false,
    supportsWebhook: true,
    supportsServerVerification: true,
    supportedCurrencies: [TransactionCurrency.PI],
    supportedTypes,
  },
];

export const PROVIDER_CREDENTIAL_REQUIREMENTS: ProviderCredentialRequirements[] = [
  {
    provider: TransactionProvider.PAWAPAY,
    requiredInProduction: [
      'PAWAPAY_API_KEY',
      'PAWAPAY_WEBHOOK_SECRET',
    ],
    optionalInSandbox: ['PAWAPAY_BASE_URL'],
    callbackRequirements: ['Deposit status webhook URL'],
  },
  {
    provider: TransactionProvider.BINANCE_PAY,
    requiredInProduction: [
      'BINANCE_PAY_API_KEY',
      'BINANCE_PAY_SECRET_KEY',
    ],
    optionalInSandbox: ['BINANCE_PAY_BASE_URL'],
    callbackRequirements: ['Order notification webhook URL'],
  },
  {
    provider: TransactionProvider.PI_NETWORK,
    requiredInProduction: ['PI_API_KEY'],
    optionalInSandbox: ['PI_SANDBOX_APP_ID'],
    callbackRequirements: [
      'Pi payment approval and completion callbacks',
    ],
  },
];

export const PROVIDER_SANDBOX_CONTRACTS: ProviderSandboxContract[] = [
  {
    provider: TransactionProvider.PAWAPAY,
    sandboxExternalRefPrefix: 'test_pawapay_',
    pendingStatus: 'PENDING',
    successStatus: 'COMPLETED',
    failedStatus: 'FAILED',
    webhookEventIdField: 'eventId',
    paymentReferenceField: 'depositId',
  },
  {
    provider: TransactionProvider.BINANCE_PAY,
    sandboxExternalRefPrefix: 'test_binance_pay_',
    pendingStatus: 'PENDING',
    successStatus: 'PAID',
    failedStatus: 'FAILED',
    webhookEventIdField: 'eventId',
    paymentReferenceField: 'merchantTradeNo',
  },
  {
    provider: TransactionProvider.PI_NETWORK,
    sandboxExternalRefPrefix: 'test_pi_',
    pendingStatus: 'PENDING',
    successStatus: 'COMPLETED',
    failedStatus: 'CANCELLED',
    webhookEventIdField: 'paymentId',
    paymentReferenceField: 'identifier',
  },
];

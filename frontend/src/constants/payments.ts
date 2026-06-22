import { APP_CHANNEL, LynkAppChannel } from './channel';

export { APP_CHANNEL };

export type PaymentProvider = 'pawapay' | 'binance_pay' | 'pi_network';

export interface PaymentMethod {
  provider: PaymentProvider;
  label: string;
  description: string;
  channel: LynkAppChannel;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    provider: 'pawapay',
    label: 'PawaPay',
    description: 'Mobile Money pour les marchés africains supportés.',
    channel: 'global',
  },
  {
    provider: 'binance_pay',
    label: 'Binance Pay',
    description: 'Paiement crypto international via Binance Pay.',
    channel: 'global',
  },
  {
    provider: 'pi_network',
    label: 'Pi Network',
    description: 'Paiement Pi via Pi SDK dans le navigateur Pi.',
    channel: 'pi',
  },
];

export function getPaymentMethodsForChannel(
  channel: LynkAppChannel = APP_CHANNEL,
): PaymentMethod[] {
  return PAYMENT_METHODS.filter((method) => method.channel === channel);
}

export function isPaymentProviderAllowed(
  provider: PaymentProvider,
  channel: LynkAppChannel = APP_CHANNEL,
): boolean {
  return getPaymentMethodsForChannel(channel).some(
    (method) => method.provider === provider,
  );
}

export function assertPaymentProviderAllowed(
  provider: PaymentProvider,
  channel: LynkAppChannel = APP_CHANNEL,
): void {
  if (!isPaymentProviderAllowed(provider, channel)) {
    throw new Error(
      `Payment provider ${provider} is not allowed in ${channel} frontend`,
    );
  }
}

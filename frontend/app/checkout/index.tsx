import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PaymentMethodSelector } from '../../src/components/PaymentMethodSelector';
import { APP_CHANNEL } from '../../src/constants/channel';
import {
  getPaymentMethodsForChannel,
  PaymentProvider,
} from '../../src/constants/payments';
import { COLORS, SPACING } from '../../src/constants/theme';
import {
  createChannelProviderPayment,
  createPiSdkPayment,
} from '../../src/services/payment';

type CheckoutType = 'subscription' | 'gift' | 'boost' | 'staking' | 'refund';

const CHECKOUT_COPY: Record<CheckoutType, { title: string; memo: string }> = {
  subscription: {
    title: 'Lynk Premium',
    memo: 'Lynk Premium subscription',
  },
  gift: {
    title: 'Send a gift',
    memo: 'Lynk gift payment',
  },
  boost: {
    title: 'Boost / Super Like',
    memo: 'Lynk boost payment',
  },
  staking: {
    title: 'Commitment payment',
    memo: 'Lynk commitment payment',
  },
  refund: {
    title: 'Refund flow',
    memo: 'Lynk refund flow',
  },
};

function parseCheckoutType(value: unknown): CheckoutType {
  return value === 'gift' ||
    value === 'boost' ||
    value === 'staking' ||
    value === 'refund'
    ? value
    : 'subscription';
}

function parseAmount(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const amount = Number(raw ?? 10);
  return Number.isFinite(amount) && amount > 0 ? amount : 10;
}

function statusPath(
  status: 'success' | 'pending' | 'failed',
  params: Record<string, string>,
) {
  const query = new URLSearchParams(params).toString();
  return `/payment/${status}${query ? `?${query}` : ''}`;
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const checkoutType = parseCheckoutType(params.type);
  const amount = parseAmount(params.amount);
  const copy = CHECKOUT_COPY[checkoutType];
  const methods = useMemo(() => getPaymentMethodsForChannel(APP_CHANNEL), []);
  const [selectedProvider, setSelectedProvider] = useState<
    PaymentProvider | undefined
  >(methods[0]?.provider);
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    if (!selectedProvider) return;
    setLoading(true);
    try {
      if (APP_CHANNEL === 'pi') {
        const result = await createPiSdkPayment({
          amount,
          memo: copy.memo,
          metadata: { type: checkoutType, source: 'checkout' },
        });
        router.replace(
          statusPath('pending', {
            provider: 'pi_network',
            type: checkoutType,
            amount: String(amount),
            ref: result.identifier,
          }),
        );
        return;
      }

      const result = await createChannelProviderPayment({
        provider: selectedProvider,
        amount,
        currency: 'usd',
        type: checkoutType,
        metadata: { source: 'checkout' },
      });

      if (result.checkoutUrl) {
        await Linking.openURL(result.checkoutUrl);
        router.replace(
          statusPath('pending', {
            provider: selectedProvider,
            type: checkoutType,
            amount: String(amount),
            ref: result.externalRef,
          }),
        );
      } else {
        router.replace(
          statusPath('success', {
            provider: selectedProvider,
            type: checkoutType,
            amount: String(amount),
            ref: result.externalRef,
          }),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert('Payment unavailable', message);
      router.replace(
        statusPath('failed', {
          provider: selectedProvider,
          type: checkoutType,
          amount: String(amount),
          reason: message,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.kicker}>
          {APP_CHANNEL === 'pi' ? 'Pi Frontend' : 'Global Frontend'}
        </Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>
          {APP_CHANNEL === 'pi'
            ? 'This channel accepts only Pi Network through the Pi SDK.'
            : 'This channel accepts only PawaPay and Binance Pay.'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Amount</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
      </View>

      <PaymentMethodSelector
        selectedProvider={selectedProvider}
        onSelect={setSelectedProvider}
      />

      <Pressable
        accessibilityRole="button"
        disabled={loading || !selectedProvider}
        onPress={startCheckout}
        style={[styles.button, (loading || !selectedProvider) && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Starting…' : 'Continue to payment'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    gap: SPACING.lg,
    padding: SPACING.lg,
  },
  header: {
    gap: SPACING.sm,
    paddingTop: SPACING.xl,
  },
  back: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  kicker: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  amount: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 18,
    padding: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
  },
});

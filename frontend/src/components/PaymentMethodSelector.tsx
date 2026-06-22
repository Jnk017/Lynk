import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import {
  APP_CHANNEL,
  getPaymentMethodsForChannel,
  PaymentProvider,
} from '../constants/payments';

interface PaymentMethodSelectorProps {
  selectedProvider?: PaymentProvider;
  onSelect: (provider: PaymentProvider) => void;
}

export function PaymentMethodSelector({
  selectedProvider,
  onSelect,
}: PaymentMethodSelectorProps) {
  const methods = getPaymentMethodsForChannel(APP_CHANNEL);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moyen de paiement</Text>
      <Text style={styles.subtitle}>
        {APP_CHANNEL === 'pi'
          ? 'Le frontend Pi accepte uniquement Pi Network.'
          : 'Le frontend Global accepte PawaPay et Binance Pay.'}
      </Text>
      <View style={styles.list}>
        {methods.map((method) => {
          const selected = selectedProvider === method.provider;
          return (
            <Pressable
              key={method.provider}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(method.provider)}
              style={[styles.method, selected && styles.methodSelected]}
            >
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: SPACING.sm,
  },
  method: {
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  methodSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surfaceLight,
  },
  methodLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  methodDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});

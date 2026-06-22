import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function WalletScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>WALLET</Text>
        <Text style={styles.title}>Fund your Lynk wallet</Text>
        <Text style={styles.subtitle}>
          Cash-in is routed through the active frontend channel: PawaPay/Binance
          Pay on Global and Pi SDK on Pi.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/checkout?type=subscription&amount=10&source=wallet')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Cash in</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/wallet/history')}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Transaction history</Text>
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
  kicker: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
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
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 18,
    padding: SPACING.md,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

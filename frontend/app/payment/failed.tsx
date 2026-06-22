import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { trackPaymentTelemetry } from '../../src/services/paymentTelemetry';

export default function PaymentFailedScreen() {
  const params = useLocalSearchParams();
  const provider = String(params.provider ?? 'n/a');
  const reference = String(params.ref ?? 'n/a');

  useEffect(() => {
    void trackPaymentTelemetry('payment_failed_viewed', {
      provider,
      reference,
      status: 'failed',
    });
  }, [provider, reference]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, textAlign: 'center' }}>!</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Payment failed
      </Text>
      <Text style={{ marginTop: 12, textAlign: 'center' }}>
        Provider: {provider}
      </Text>
      <Text style={{ marginTop: 4, textAlign: 'center' }}>
        Reference: {reference}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/checkout')}
        style={{ alignItems: 'center', marginTop: 24, padding: 16 }}
      >
        <Text>Try again</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/wallet/history')}
        style={{ alignItems: 'center', marginTop: 8, padding: 16 }}
      >
        <Text>View history</Text>
      </Pressable>
    </View>
  );
}

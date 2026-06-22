import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { getPaymentStatusByReference } from '../../src/services/paymentStatus';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const reference = String(params.ref ?? '');
  const provider = String(params.provider ?? 'n/a');
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['payment-status', reference],
    queryFn: () => getPaymentStatusByReference(reference),
    enabled: Boolean(reference),
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, textAlign: 'center' }}>✓</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Payment confirmed
      </Text>
      <Text style={{ marginTop: 12, textAlign: 'center' }}>
        Provider: {provider}
      </Text>
      <Text style={{ marginTop: 4, textAlign: 'center' }}>
        Reference: {reference || 'n/a'}
      </Text>
      <Text style={{ marginTop: 4, textAlign: 'center' }}>
        Backend status: {data?.status ?? 'checking'}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void refetch()}
        style={{ alignItems: 'center', marginTop: 24, padding: 16 }}
      >
        <Text>{isFetching ? 'Checking…' : 'Refresh status'}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/profile')}
        style={{ alignItems: 'center', marginTop: 8, padding: 16 }}
      >
        <Text>Back to profile</Text>
      </Pressable>
    </View>
  );
}

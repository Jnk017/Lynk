import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getPaymentStatusByReference } from '../../src/services/paymentStatus';

export default function PaymentPendingScreen() {
  const params = useLocalSearchParams();
  const reference = String(params.ref ?? '');
  const provider = String(params.provider ?? 'n/a');

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['payment-status', reference],
    queryFn: () => getPaymentStatusByReference(reference),
    enabled: Boolean(reference),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (data?.status === 'completed') {
      router.replace(`/payment/success?provider=${provider}&ref=${reference}`);
    }
    if (data?.status === 'failed' || data?.status === 'cancelled') {
      router.replace(`/payment/failed?provider=${provider}&ref=${reference}`);
    }
  }, [data?.status, provider, reference]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, textAlign: 'center' }}>…</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Payment pending
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
        <Text>{isFetching ? 'Checking…' : 'Check now'}</Text>
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

import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { API_ENDPOINTS } from '../../src/constants/api';
import { api } from '../../src/services/api';
import { PaymentTransactionSummary } from '../../src/services/paymentStatus';

export default function WalletHistoryScreen() {
  const { data = [], isLoading, isError, refetch } = useQuery<
    PaymentTransactionSummary[]
  >({
    queryKey: ['payment-transactions'],
    queryFn: () => api.get<PaymentTransactionSummary[]>(API_ENDPOINTS.payment.transactions),
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Wallet history</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/wallet')}>
        <Text>Cash in</Text>
      </Pressable>
      {isLoading ? <Text>Loading transactions…</Text> : null}
      {isError ? (
        <Pressable accessibilityRole="button" onPress={() => void refetch()}>
          <Text>Retry</Text>
        </Pressable>
      ) : null}
      {!isLoading && !isError && data.length === 0 ? (
        <Text>No transactions yet.</Text>
      ) : null}
      {data.map((tx) => (
        <View key={tx.id} style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontWeight: '700' }}>{tx.type ?? 'Payment'}</Text>
          <Text>{tx.provider ?? 'provider'} · {tx.status ?? 'status'}</Text>
          <Text>{tx.amount ?? 0} {tx.currency ?? ''}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

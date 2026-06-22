import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function WalletHistoryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Wallet history
      </Text>
      <Text style={{ marginTop: 12, textAlign: 'center' }}>
        Transaction history route is ready for backend-backed rendering.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/wallet')}
        style={{ alignItems: 'center', marginTop: 24, padding: 16 }}
      >
        <Text>Cash in</Text>
      </Pressable>
    </View>
  );
}

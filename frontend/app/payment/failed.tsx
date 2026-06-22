import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function PaymentFailedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, textAlign: 'center' }}>!</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Payment failed
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/checkout')}
        style={{ alignItems: 'center', marginTop: 24, padding: 16 }}
      >
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, textAlign: 'center' }}>✓</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
        Payment confirmed
      </Text>
      <Text style={{ marginTop: 12, textAlign: 'center' }}>
        Provider: {String(params.provider ?? 'n/a')}
      </Text>
      <Text style={{ marginTop: 4, textAlign: 'center' }}>
        Reference: {String(params.ref ?? 'n/a')}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/profile')}
        style={{ alignItems: 'center', marginTop: 24, padding: 16 }}
      >
        <Text>Back to profile</Text>
      </Pressable>
    </View>
  );
}

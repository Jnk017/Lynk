import { Pressable, Text, View } from 'react-native';
import { authenticateWithPi } from '../../src/services/pi/pi-sdk.service';

export default function PiAuthScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '700' }}>Lynk</Text>
      <Text style={{ marginVertical: 16 }}>Connect with verified people</Text>
      <Pressable onPress={() => void authenticateWithPi()} style={{ backgroundColor: '#111827', padding: 16, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Continue with Pi</Text>
      </Pressable>
    </View>
  );
}

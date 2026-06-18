import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Lynk</Text>
      <Text style={styles.title}>Welcome to Lynk</Text>
      <Text style={styles.subtitle}>Connect with verified people and start matching securely.</Text>
      <Pressable style={styles.button} onPress={() => router.push('/auth/pi')}>
        <Text style={styles.buttonText}>Continue with Pi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#050816' },
  brand: { color: '#ffffff', fontSize: 38, fontWeight: '800', marginBottom: 12 },
  title: { color: '#ffffff', fontSize: 26, fontWeight: '700', marginBottom: 10 },
  subtitle: { color: '#cbd5e1', fontSize: 16, lineHeight: 24, marginBottom: 28 },
  button: { backgroundColor: '#111827', padding: 16, borderRadius: 12 },
  buttonText: { color: '#ffffff', textAlign: 'center', fontWeight: '700' },
});

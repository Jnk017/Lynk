import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, TextField } from '../../src/components/premium';
import { useAuth } from '../../src/providers/AuthProvider';
import { getErrorMessage } from '../../src/utils/errors';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { COLORS, TYPOGRAPHY, GRADIENTS, SPACING } from '../../src/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, 'We could not sign you in. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.kicker}>WELCOME BACK</Text>
              <Text accessibilityRole="header" style={styles.title}>Continue your Lynk journey.</Text>
              <Text style={styles.subtitle}>Sign in to reconnect with your community and conversations.</Text>
            </View>

            <Card style={styles.card} accessibilityLabel="Sign in form">
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="current-password"
                error={error || undefined}
                onSubmitEditing={handleLogin}
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Forgot password" style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </Card>

            <Button label="Sign In" variant="premiumGold" onPress={handleLogin} loading={loading} accessibilityHint="Signs in to your Lynk account" />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to Lynk?</Text>
              <Pressable accessibilityRole="link" accessibilityLabel="Create a Lynk account" onPress={() => router.replace('/auth/register')} style={styles.inlineAction}>
                <Text style={styles.registerLink}>Create account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, gap: SPACING.xl },
  backButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { ...TYPOGRAPHY.bodySecondary },
  header: { gap: SPACING.sm },
  kicker: { ...TYPOGRAPHY.label, color: COLORS.gold, letterSpacing: 2 },
  title: { ...TYPOGRAPHY.h1 },
  subtitle: { ...TYPOGRAPHY.bodySecondary },
  card: { gap: SPACING.lg },
  forgotButton: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center' },
  forgotText: { ...TYPOGRAPHY.caption, color: COLORS.gold },
  registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: SPACING.xs },
  registerText: { ...TYPOGRAPHY.caption },
  inlineAction: { minHeight: 44, justifyContent: 'center' },
  registerLink: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
});

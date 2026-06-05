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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '', referralCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleRegister = async () => {
    if (!form.displayName.trim() || !form.email.trim() || !form.password) return setError('Complete your name, email, and password.');
    if (form.password !== form.confirmPassword) return setError('Your passwords do not match.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    setError('');
    setLoading(true);
    try {
      await register({ displayName: form.displayName.trim(), email: form.email.trim(), password: form.password, referralCode: form.referralCode.trim() || undefined });
      router.replace('/auth/onboarding');
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, 'We could not create your account. Please try again.'));
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <View style={styles.header}>
              <Text style={styles.kicker}>CREATE YOUR PROFILE</Text>
              <Text accessibilityRole="header" style={styles.title}>Start with intention.</Text>
              <Text style={styles.subtitle}>Build a trusted profile around the values and future you want to share.</Text>
            </View>
            <Card style={styles.card} accessibilityLabel="Account registration form">
              <TextField label="Display name" value={form.displayName} onChangeText={update('displayName')} placeholder="How should people know you?" autoCapitalize="words" autoComplete="name" />
              <TextField label="Email" value={form.email} onChangeText={update('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <TextField label="Password" value={form.password} onChangeText={update('password')} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" />
              <TextField label="Confirm password" value={form.confirmPassword} onChangeText={update('confirmPassword')} placeholder="Repeat your password" secureTextEntry autoComplete="new-password" error={error || undefined} />
              <TextField label="Referral code · optional" value={form.referralCode} onChangeText={update('referralCode')} placeholder="Enter a Lynk referral code" autoCapitalize="characters" />
            </Card>
            <Button label="Create Account" variant="premiumGold" onPress={handleRegister} loading={loading} accessibilityHint="Creates your Lynk account" />
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Pressable accessibilityRole="link" accessibilityLabel="Sign in" onPress={() => router.replace('/auth/login')} style={styles.inlineAction}>
                <Text style={styles.loginLink}>Sign in</Text>
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
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.xs },
  loginText: { ...TYPOGRAPHY.caption },
  inlineAction: { minHeight: 44, justifyContent: 'center' },
  loginLink: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
});

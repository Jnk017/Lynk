import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.displayName || !form.email || !form.password) {
      setError('Please fill in required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        referralCode: form.referralCode || undefined,
      });
      router.replace('/auth/onboarding');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Join Lynk</Text>
              <Text style={styles.subtitle}>
                First 2500 members become permanent Founders 👑
              </Text>
            </View>

            <GlassCard style={styles.card}>
              {[
                { label: 'Full Name *', key: 'displayName', placeholder: 'Your display name', autoCapitalize: 'words' as const },
                { label: 'Email *', key: 'email', placeholder: 'your@email.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
                { label: 'Password *', key: 'password', placeholder: 'At least 8 characters', secure: true },
                { label: 'Confirm Password *', key: 'confirmPassword', placeholder: 'Repeat your password', secure: true },
                { label: 'Referral Code (optional)', key: 'referralCode', placeholder: 'Enter a referral code', autoCapitalize: 'characters' as const },
              ].map((field, idx) => (
                <View key={field.key} style={{ marginTop: idx > 0 ? SPACING.md : 0 }}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[field.key as keyof typeof form]}
                    onChangeText={update(field.key as keyof typeof form)}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={field.secure}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || 'none'}
                  />
                </View>
              ))}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </GlassCard>

            <NeonButton
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: SPACING.xl }}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={[styles.loginText, { color: COLORS.electricBlue, fontWeight: '700' }]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  back: { marginBottom: SPACING.xl },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  header: { marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.bodySecondary, lineHeight: 22 },
  card: { marginBottom: SPACING.lg },
  inputLabel: { ...TYPOGRAPHY.label, marginBottom: SPACING.xs },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  error: { color: COLORS.error, marginTop: SPACING.sm, fontSize: 14 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
});

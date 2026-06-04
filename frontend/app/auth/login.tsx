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
import { getErrorMessage } from '../../src/utils/errors';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your Lynk account</Text>
            </View>

            <GlassCard style={styles.card}>
              <Text style={styles.inputLabel}>Email or Phone</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </GlassCard>

            <NeonButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={{ marginTop: SPACING.xl }}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/register')}>
                <Text style={[styles.registerText, { color: COLORS.electricBlue, fontWeight: '700' }]}>
                  Create one
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
  subtitle: { ...TYPOGRAPHY.bodySecondary },
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
  forgotPassword: { marginTop: SPACING.md, alignSelf: 'flex-end' },
  forgotText: { color: COLORS.electricBlue, fontSize: 14 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  registerText: { color: COLORS.textSecondary, fontSize: 14 },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/providers/AuthProvider";
import { getErrorMessage } from "../../src/utils/errors";
import { NeonButton } from "../../src/components/ui/NeonButton";
import { GlassCard } from "../../src/components/ui/GlassCard";
import {
  COLORS,
  TYPOGRAPHY,
  GRADIENTS,
  SPACING,
} from "../../src/constants/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.displayName || !form.email || !form.password) {
      setError("Please fill in required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (
      form.password.length < 12 ||
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      setError(
        "Password must be 12+ characters with upper/lowercase letters and a number",
      );
      return;
    }

    if (!consents.terms || !consents.privacy || !consents.age) {
      setError(
        "Terms, Privacy Policy, and confirmation that you are 18+ are required",
      );
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        referralCode: form.referralCode || undefined,
        termsAccepted: consents.terms,
        privacyAccepted: consents.privacy,
        ageConfirmed: consents.age,
        marketingConsent: consents.marketing,
        language: "fr",
        documentVersion: "2.0",
      });
      router.replace("/auth/onboarding");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
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
                {
                  label: "Full Name *",
                  key: "displayName",
                  placeholder: "Your display name",
                  autoCapitalize: "words" as const,
                },
                {
                  label: "Email *",
                  key: "email",
                  placeholder: "your@email.com",
                  keyboardType: "email-address" as const,
                  autoCapitalize: "none" as const,
                },
                {
                  label: "Password *",
                  key: "password",
                  placeholder: "12+ chars, upper/lowercase and number",
                  secure: true,
                },
                {
                  label: "Confirm Password *",
                  key: "confirmPassword",
                  placeholder: "Repeat your password",
                  secure: true,
                },
                {
                  label: "Referral Code (optional)",
                  key: "referralCode",
                  placeholder: "Enter a referral code",
                  autoCapitalize: "characters" as const,
                },
              ].map((field, idx) => (
                <View
                  key={field.key}
                  style={{ marginTop: idx > 0 ? SPACING.md : 0 }}
                >
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[field.key as keyof typeof form]}
                    onChangeText={update(field.key as keyof typeof form)}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={field.secure}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || "none"}
                  />
                </View>
              ))}

              <View style={{ marginTop: SPACING.lg, gap: SPACING.sm }}>
                {[
                  {
                    key: "terms",
                    label: "I accept the Terms of Service *",
                    route: "/legal/terms",
                  },
                  {
                    key: "privacy",
                    label: "I acknowledge the Privacy Policy *",
                    route: "/legal/privacy",
                  },
                  {
                    key: "age",
                    label: "I confirm that I am at least 18 years old *",
                  },
                  {
                    key: "marketing",
                    label: "I agree to receive marketing (optional)",
                  },
                ].map((item) => (
                  <View key={item.key} style={styles.consentRow}>
                    <TouchableOpacity
                      accessibilityRole="checkbox"
                      accessibilityState={{
                        checked: consents[item.key as keyof typeof consents],
                      }}
                      onPress={() =>
                        setConsents((c) => ({
                          ...c,
                          [item.key]: !c[item.key as keyof typeof c],
                        }))
                      }
                      style={styles.checkbox}
                    >
                      <Text style={styles.checkboxText}>
                        {consents[item.key as keyof typeof consents]
                          ? "☑"
                          : "☐"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={!item.route}
                      onPress={() =>
                        item.route && router.push(item.route as never)
                      }
                      style={{
                        flex: 1,
                        minHeight: 48,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={[
                          styles.consentText,
                          item.route ? { color: COLORS.electricBlue } : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {error ? (
                <Text accessibilityLiveRegion="polite" style={styles.error}>
                  {error}
                </Text>
              ) : null}
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
              <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                <Text
                  style={[
                    styles.loginText,
                    { color: COLORS.electricBlue, fontWeight: "700" },
                  ]}
                >
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  back: { marginBottom: SPACING.xl },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  header: { marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.bodySecondary, lineHeight: 22 },
  card: { marginBottom: SPACING.lg },
  inputLabel: { ...TYPOGRAPHY.label, marginBottom: SPACING.xs },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  consentRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  checkbox: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxText: { color: COLORS.electricBlue, fontSize: 24 },
  consentText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20 },
  error: { color: COLORS.error, marginTop: SPACING.sm, fontSize: 14 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
});

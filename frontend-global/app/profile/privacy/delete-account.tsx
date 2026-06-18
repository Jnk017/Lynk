import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafetyScreen } from "../../../src/components/safety/SafetyScreen";
import { api } from "../../../src/services/api";
import { API_ENDPOINTS } from "../../../src/constants/api";
import { COLORS, SPACING } from "../../../src/constants/theme";
import { useAuth } from "../../../src/providers/AuthProvider";
export default function DeleteAccount() {
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!confirmed) {
      setMessage("Confirm that you understand the consequences.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.post<{ scheduledFor: string }>(
        API_ENDPOINTS.legal.deleteAccount,
        { password, confirmDeletion: true },
      );
      setMessage(
        `Deletion scheduled for ${new Date(result.scheduledFor).toLocaleDateString()}. You can cancel during the 30-day grace period.`,
      );
      setTimeout(() => void logout(), 1200);
    } catch {
      setMessage(
        "Password verification failed or the request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafetyScreen
      title="Delete Account"
      subtitle="Permanent deletion starts after a 30-day grace period."
    >
      <View style={{ gap: SPACING.md }}>
        <Text style={{ color: COLORS.textPrimary, lineHeight: 22 }}>
          Deleting your account removes access, profile visibility, matches, and
          service data after the grace period. Some safety, financial,
          legal-hold, and fraud-prevention records may be retained as required
          by law.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/profile/privacy")}
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={{ color: COLORS.electricBlue, fontWeight: "700" }}>
            Download My Data first
          </Text>
        </TouchableOpacity>
        <TextInput
          accessibilityLabel="Password verification"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Verify your password"
          placeholderTextColor={COLORS.textTertiary}
          style={{
            minHeight: 52,
            borderWidth: 1,
            borderColor: COLORS.glassBorder,
            borderRadius: 12,
            padding: 14,
            color: "white",
          }}
        />
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          onPress={() => setConfirmed(!confirmed)}
          style={{
            minHeight: 52,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ color: COLORS.electricBlue, fontSize: 22 }}>
            {confirmed ? "☑" : "☐"}
          </Text>
          <Text style={{ color: COLORS.textPrimary, flex: 1 }}>
            I understand the consequences and request account deletion.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={busy || !password}
          onPress={submit}
          style={{
            minHeight: 52,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.error,
            borderRadius: 12,
            opacity: busy || !password ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>
            {busy ? "Submitting…" : "Start 30-day grace period"}
          </Text>
        </TouchableOpacity>
        {message ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: COLORS.textPrimary }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </SafetyScreen>
  );
}

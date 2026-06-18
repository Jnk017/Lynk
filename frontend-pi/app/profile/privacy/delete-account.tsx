import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../src/services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../src/constants/theme";

export default function DeleteAccountScreen() {
  const [confirmed, setConfirmed] = useState(false);
  const deletion = useMutation({
    mutationFn: () => api.post("/privacy/delete-account", { confirmDeletion: true }),
    onSuccess: () => {
      Alert.alert("Request received", "Your account deletion grace period has started.");
    },
    onError: () => {
      Alert.alert("Unable to submit request", "The request could not be completed. Please try again.");
    },
  });

  return (
    <View style={privacyStyles.screen}>
      <Text style={privacyStyles.title}>Delete account</Text>
      <Text style={privacyStyles.copy}>
        This starts a 30-day grace period. Your profile is hidden immediately while Lynk processes the request.
      </Text>
      <TouchableOpacity style={privacyStyles.checkRow} onPress={() => setConfirmed((value) => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }}>
        <View style={[privacyStyles.checkbox, confirmed && privacyStyles.checkboxOn]} />
        <Text style={privacyStyles.checkCopy}>I understand this will hide my profile and start account deletion.</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={!confirmed || deletion.isPending} onPress={() => deletion.mutate()} style={[privacyStyles.dangerButton, { opacity: !confirmed || deletion.isPending ? 0.6 : 1 }]}>
        {deletion.isPending ? <ActivityIndicator color="#fff" /> : <Text style={privacyStyles.dangerText}>Start account deletion</Text>}
      </TouchableOpacity>
    </View>
  );
}

const privacyStyles = StyleSheet.create({
  screen: { flex: 1, padding: SPACING.xl, backgroundColor: COLORS.background },
  title: { ...TYPOGRAPHY.h1, marginBottom: SPACING.md },
  copy: { ...TYPOGRAPHY.bodySecondary, marginBottom: SPACING.lg },
  checkRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.xl },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  checkboxOn: { backgroundColor: COLORS.electricBlue, borderColor: COLORS.electricBlue },
  checkCopy: { flex: 1, color: COLORS.textPrimary },
  dangerButton: { backgroundColor: COLORS.error, borderRadius: 12, padding: SPACING.md, alignItems: "center" },
  dangerText: { color: "#fff", fontWeight: "700" },
});

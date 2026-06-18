import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import {
  SafetyCard,
  SafetyScreen,
  safetyStyles,
} from "../../../src/components/safety/SafetyScreen";
import { api } from "../../../src/services/api";
import { API_ENDPOINTS } from "../../../src/constants/api";
import { COLORS } from "../../../src/constants/theme";
export default function PrivacyCenter() {
  const [status, setStatus] = useState("");
  const download = async () => {
    setStatus("Preparing export…");
    try {
      const data = await api.get<Record<string, unknown>>(
        API_ENDPOINTS.legal.exportData,
      );
      if (Platform.OS === "web" && typeof document !== "undefined") {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          }),
        );
        a.download = `lynk-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus("Export downloaded.");
      } else
        setStatus(
          "Export prepared. Use the web app to download the JSON file.",
        );
    } catch {
      setStatus("Could not prepare your export. Please try again.");
    }
  };
  return (
    <SafetyScreen
      title="Privacy Center"
      subtitle="Exercise your access, portability, objection, restriction, correction, and deletion rights."
    >
      <View style={safetyStyles.stack}>
        <SafetyCard
          icon="↓"
          title="Download My Data"
          description="Export profile, photos, chats, verification details, reports, wallet history, and legal acceptance records."
          onPress={download}
        />
        <SafetyCard
          icon="§"
          title="Legal & Compliance"
          description="Read all policies in French, English, or Spanish."
          onPress={() => router.push("/legal")}
        />
        <SafetyCard
          icon="×"
          title="Delete Account"
          description="Verify your password, review consequences, export your data, and start the 30-day grace period."
          onPress={() => router.push("/profile/privacy/delete-account")}
        />
        {status ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: COLORS.textPrimary }}
          >
            {status}
          </Text>
        ) : null}
      </View>
    </SafetyScreen>
  );
}

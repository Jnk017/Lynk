import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/providers/AuthProvider";
import {
  SafetyCard,
  SafetyScreen,
  safetyStyles,
} from "../../src/components/safety/SafetyScreen";

export default function SettingsScreen() {
  const { user } = useAuth();
  const canModerate = ["moderator", "admin", "super_admin"].includes(
    user?.role || "",
  );
  return (
    <SafetyScreen
      title="Settings"
      subtitle="Manage your account, privacy, and safety preferences."
    >
      <View style={safetyStyles.stack}>
        <SafetyCard
          icon="◇"
          title="Safety Center"
          description="Guidelines, reporting, blocking, verification, tips, and support."
          onPress={() => router.push("/safety")}
        />
        <SafetyCard
          icon="!"
          title="My Reports"
          description="Review the status of safety reports you submitted."
          onPress={() => router.push("/safety/reports")}
        />
        <SafetyCard
          icon="⊘"
          title="Blocked Members"
          description="See and manage members you have blocked."
          onPress={() => router.push("/safety/blocked")}
        />
        {canModerate ? (
          <SafetyCard
            icon="✦"
            title="Moderation workspace"
            description="Review reports and pending verification requests."
            onPress={() => router.push("/admin/moderation")}
          />
        ) : null}
        <SafetyCard
          icon="§"
          title="Legal & Compliance"
          description="Terms, privacy, KYC, payments, safety, retention, and all compliance policies."
          onPress={() => router.push("/legal")}
        />
        <SafetyCard
          icon="◈"
          title="Privacy Center"
          description="Download your data or start the protected account deletion flow."
          onPress={() => router.push("/profile/privacy")}
        />
        <SafetyCard
          icon="✓"
          title="Verification"
          description="Manage identity and profile verification."
          onPress={() => router.push("/profile/verification")}
        />
      </View>
    </SafetyScreen>
  );
}

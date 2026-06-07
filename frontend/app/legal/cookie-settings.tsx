import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafetyScreen } from "../../src/components/safety/SafetyScreen";
import { COLORS, SPACING } from "../../src/constants/theme";

const STORAGE_KEY = "lynk.cookie-consent.v2";
type OptionalCategory =
  | "analytics"
  | "performance"
  | "advertising"
  | "personalization";
const labels: Record<OptionalCategory, string> = {
  analytics: "Analytics",
  performance: "Performance",
  advertising: "Advertising",
  personalization: "Personalization",
};
const defaults: Record<OptionalCategory, boolean> = {
  analytics: false,
  performance: false,
  advertising: false,
  personalization: false,
};

export default function CookieSettings() {
  const [choices, setChoices] = useState(defaults);
  const [message, setMessage] = useState(
    "Optional technologies remain off until you choose otherwise.",
  );
  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value)
          setChoices({
            ...defaults,
            ...(JSON.parse(value) as Partial<typeof defaults>),
          });
      })
      .catch(() => undefined);
  }, []);
  const save = async (next = choices) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...next,
        version: "2.0",
        savedAt: new Date().toISOString(),
      }),
    );
    setChoices(next);
    setMessage(
      "Your consent choices have been saved. You can change them at any time.",
    );
  };
  const setAll = (enabled: boolean) =>
    void save({
      analytics: enabled,
      performance: enabled,
      advertising: enabled,
      personalization: enabled,
    });
  return (
    <SafetyScreen
      title="Cookie Settings"
      subtitle="Essential technologies are always active for security and core operation."
    >
      <View style={{ gap: SPACING.md }}>
        <View
          style={{
            minHeight: 56,
            padding: 14,
            borderRadius: 12,
            backgroundColor: COLORS.surface,
          }}
        >
          <Text style={{ color: COLORS.textPrimary, fontWeight: "800" }}>
            Essential
          </Text>
          <Text style={{ color: COLORS.textSecondary }}>
            Always on · authentication, security, preferences, and core service
            delivery.
          </Text>
        </View>
        {(Object.keys(labels) as OptionalCategory[]).map((key) => (
          <TouchableOpacity
            key={key}
            accessibilityRole="switch"
            accessibilityState={{ checked: choices[key] }}
            onPress={() =>
              setChoices((current) => ({ ...current, [key]: !current[key] }))
            }
            style={{
              minHeight: 56,
              padding: 14,
              borderRadius: 12,
              backgroundColor: COLORS.surface,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textPrimary, fontWeight: "800" }}>
                {labels[key]}
              </Text>
              <Text style={{ color: COLORS.textSecondary }}>
                Optional · requires your consent where applicable.
              </Text>
            </View>
            <Text style={{ color: COLORS.electricBlue, fontSize: 22 }}>
              {choices[key] ? "●" : "○"}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setAll(false)}
            style={{
              flex: 1,
              minHeight: 52,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.electricBlue,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: COLORS.electricBlue, fontWeight: "800" }}>
              Reject optional
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAll(true)}
            style={{
              flex: 1,
              minHeight: 52,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.primaryViolet,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>
              Accept all
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => void save()}
          style={{
            minHeight: 52,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.surface,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: COLORS.textPrimary, fontWeight: "800" }}>
            Save selected choices
          </Text>
        </TouchableOpacity>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: COLORS.textSecondary, lineHeight: 21 }}
        >
          {message}
        </Text>
      </View>
    </SafetyScreen>
  );
}

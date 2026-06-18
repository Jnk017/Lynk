import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import {
  SafetyCard,
  SafetyScreen,
  safetyStyles,
} from "../../src/components/safety/SafetyScreen";
import {
  LEGAL_DOCUMENTS,
  LEGAL_LANGUAGES,
  LegalLanguage,
  legalTitle,
} from "../../src/features/legal/catalog";
import { COLORS, SPACING } from "../../src/constants/theme";
export default function LegalIndex() {
  const [language, setLanguage] = useState<LegalLanguage>("fr");
  return (
    <SafetyScreen
      title="Legal & Compliance"
      subtitle="Versioned policies from Nexa Inc SARL · Français is the primary legal edition."
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Document language"
        style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.md }}
      >
        {LEGAL_LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            accessibilityRole="radio"
            accessibilityState={{ checked: language === l.code }}
            onPress={() => setLanguage(l.code)}
            style={{
              minHeight: 48,
              padding: 14,
              borderRadius: 12,
              backgroundColor:
                language === l.code ? COLORS.primaryViolet : COLORS.surface,
            }}
          >
            <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={safetyStyles.stack}>
        <SafetyCard
          icon="◉"
          title="Cookie preferences"
          description="Accept, reject, or change optional analytics, performance, advertising, and personalization technologies."
          onPress={() => router.push("/legal/cookie-settings")}
        />
        {LEGAL_DOCUMENTS.map((doc) => (
          <SafetyCard
            key={doc[0]}
            icon="§"
            title={legalTitle(doc, language)}
            description="Version 2.0 · Effective 7 June 2026"
            onPress={() =>
              router.push({
                pathname: "/legal/[slug]",
                params: { slug: doc[0], language },
              })
            }
          />
        ))}
      </View>
    </SafetyScreen>
  );
}

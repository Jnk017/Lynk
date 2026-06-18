import React, { useState } from "react";
import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafetyScreen } from "../../src/components/safety/SafetyScreen";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LANGUAGES,
  LEGAL_VERSION,
  LegalLanguage,
  getLegalDocument,
  legalAsset,
  legalTitle,
  summaries,
} from "../../src/features/legal/catalog";
import { COLORS, SPACING, TYPOGRAPHY } from "../../src/constants/theme";
export default function LegalDocumentScreen() {
  const params = useLocalSearchParams<{ slug: string; language?: string }>();
  const doc = getLegalDocument(params.slug || "");
  const [language, setLanguage] = useState<LegalLanguage>(
    (params.language as LegalLanguage) || "fr",
  );
  if (!doc)
    return (
      <SafetyScreen title="Document unavailable">
        <Text style={{ color: COLORS.textPrimary }}>
          The requested policy was not found.
        </Text>
      </SafetyScreen>
    );
  const open = (ext: "html" | "pdf") => {
    const path = legalAsset(doc[0], language, ext);
    if (Platform.OS === "web" && typeof window !== "undefined")
      window.open(path, "_blank", "noopener,noreferrer");
    else void Linking.openURL(path);
  };
  return (
    <SafetyScreen
      title={legalTitle(doc, language)}
      subtitle={`Version ${LEGAL_VERSION} · Effective ${LEGAL_EFFECTIVE_DATE}`}
    >
      <View
        accessibilityRole="radiogroup"
        style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}
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
            <Text style={{ color: "white", fontWeight: "700" }}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View
        style={{
          backgroundColor: COLORS.surface,
          padding: SPACING.lg,
          borderRadius: 16,
          gap: 12,
        }}
      >
        <Text style={TYPOGRAPHY.body}>{summaries[language]}</Text>
        <Text style={{ color: COLORS.textSecondary, lineHeight: 22 }}>
          Nexa Inc SARL{`\n`}38 Avenue Kimbemba, Quartier Masanga Mbila{`\n`}
          Commune de Mont Ngafula, Kinshasa, DRC{`\n`}legal@nexaincdrc.com ·
          +243994813049
        </Text>
        <TouchableOpacity
          accessibilityRole="link"
          onPress={() => open("html")}
          style={{
            minHeight: 52,
            justifyContent: "center",
            padding: 14,
            borderRadius: 12,
            backgroundColor: COLORS.primaryViolet,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>
            Read accessible full document
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="link"
          onPress={() => open("pdf")}
          style={{
            minHeight: 52,
            justifyContent: "center",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.electricBlue,
          }}
        >
          <Text style={{ color: COLORS.electricBlue, fontWeight: "800" }}>
            Open printable PDF
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ minHeight: 48, justifyContent: "center" }}
      >
        <Text style={{ color: COLORS.textSecondary }}>← Back</Text>
      </TouchableOpacity>
    </SafetyScreen>
  );
}

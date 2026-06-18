export type LegalLanguage = "fr" | "en" | "es";
export const LEGAL_VERSION = "2.0";
export const LEGAL_EFFECTIVE_DATE = "2026-06-07";
export const LEGAL_LANGUAGES: { code: LegalLanguage; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];
export const LEGAL_DOCUMENTS = [
  [
    "terms",
    "Conditions d’utilisation",
    "Terms of Service",
    "Términos del servicio",
  ],
  [
    "privacy",
    "Politique de confidentialité",
    "Privacy Policy",
    "Política de privacidad",
  ],
  [
    "dpa",
    "Accord de traitement des données",
    "Data Processing Agreement",
    "Acuerdo de tratamiento de datos",
  ],
  [
    "cookies",
    "Politique relative aux cookies",
    "Cookie Policy",
    "Política de cookies",
  ],
  [
    "community",
    "Règles de la communauté",
    "Community Guidelines",
    "Normas de la comunidad",
  ],
  [
    "safety",
    "Normes de sécurité",
    "Safety Standards",
    "Estándares de seguridad",
  ],
  [
    "kyc",
    "Politique KYC et vérification",
    "KYC & Identity Verification",
    "Política KYC y verificación",
  ],
  [
    "wallet",
    "Conditions portefeuille et paiements",
    "Wallet & Payment Terms",
    "Términos de cartera y pagos",
  ],
  [
    "retention",
    "Conservation des données",
    "Data Retention Policy",
    "Retención de datos",
  ],
  [
    "deletion",
    "Suppression de compte",
    "Account Deletion Policy",
    "Eliminación de cuenta",
  ],
  ["copyright", "Droit d’auteur", "Copyright Policy", "Derechos de autor"],
  [
    "intellectual-property",
    "Propriété intellectuelle",
    "Intellectual Property Policy",
    "Propiedad intelectual",
  ],
  [
    "law-enforcement",
    "Demandes des autorités",
    "Law Enforcement Requests",
    "Solicitudes policiales",
  ],
  [
    "acceptable-use",
    "Utilisation acceptable",
    "Acceptable Use Policy",
    "Uso aceptable",
  ],
  [
    "anti-fraud",
    "Politique antifraude",
    "Anti-Fraud Policy",
    "Política antifraude",
  ],
  [
    "anti-scam",
    "Politique anti-arnaque",
    "Anti-Scam Policy",
    "Política antiestafas",
  ],
  [
    "aml",
    "Lutte contre le blanchiment",
    "AML Policy",
    "Prevención del blanqueo",
  ],
  [
    "sanctions",
    "Conformité aux sanctions",
    "Sanctions Compliance",
    "Cumplimiento de sanciones",
  ],
  [
    "children-protection",
    "Protection des enfants",
    "Children Protection",
    "Protección infantil",
  ],
  [
    "transparency",
    "Cadre de transparence",
    "Transparency Framework",
    "Marco de transparencia",
  ],
] as const;
export type LegalSlug = (typeof LEGAL_DOCUMENTS)[number][0];
export function getLegalDocument(slug: string) {
  return LEGAL_DOCUMENTS.find((d) => d[0] === slug);
}
export function legalTitle(
  doc: (typeof LEGAL_DOCUMENTS)[number],
  language: LegalLanguage,
) {
  return doc[language === "fr" ? 1 : language === "en" ? 2 : 3];
}
export function legalAsset(
  slug: string,
  language: LegalLanguage,
  extension: "pdf" | "html" | "md",
) {
  return `/legal/${language}/${slug}.${extension}`;
}
export const summaries: Record<LegalLanguage, string> = {
  fr: "Consultez le document officiel, sa version, ses garanties de confidentialité et les moyens de contacter Nexa Inc SARL. La version HTML est accessible et imprimable; le PDF comprend une pagination.",
  en: "Review the official document, version, privacy safeguards, and ways to contact Nexa Inc SARL. The HTML edition is accessible and printable; the PDF includes page numbers.",
  es: "Consulte el documento oficial, su versión, las garantías de privacidad y las vías de contacto con Nexa Inc SARL. La versión HTML es accesible e imprimible; el PDF incluye páginas numeradas.",
};

export const fontFamily = {
  primary: 'Inter',
  fallback: 'System',
} as const;

export const typography = {
  displayXL: { fontSize: 44, lineHeight: 52, fontWeight: '700' as const, letterSpacing: -1.2 },
  displayL: { fontSize: 38, lineHeight: 46, fontWeight: '700' as const, letterSpacing: -1 },
  displayM: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.6 },
  headingXL: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.4 },
  headingL: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.3 },
  headingM: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const, letterSpacing: -0.2 },
  bodyLarge: { fontSize: 18, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.2 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.6 },
} as const;

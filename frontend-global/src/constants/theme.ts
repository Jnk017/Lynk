import { colors, gradients, shadows, typography, spacing, radius } from '../design-system';

export const COLORS = {
  background: colors.brand.backgroundPurple,
  surface: colors.dark.surface,
  surfaceLight: colors.dark.surfaceStrong,
  primaryViolet: colors.brand.secondaryPurple,
  electricBlue: colors.semantic.info,
  neonPink: colors.brand.lightGold,
  gold: colors.brand.primaryGold,
  platinum: '#F8FAFC',
  silver: '#CBD5E1',
  bronze: colors.brand.deepGold,
  textPrimary: colors.dark.textPrimary,
  textSecondary: colors.dark.textSecondary,
  textTertiary: colors.dark.textTertiary,
  border: colors.dark.border,
  success: colors.semantic.success,
  error: colors.semantic.danger,
  warning: colors.semantic.warning,
  overlay: colors.dark.overlay,
  glass: colors.dark.surfaceSoft,
  glassBorder: colors.dark.border,
};

export const GRADIENTS = {
  primary: gradients.lynkPurplePremium,
  gold: gradients.lynkGoldPremium,
  neon: gradients.lynkGoldPurpleHybrid,
  dark: gradients.lynkDarkLuxuryGradient,
  card: gradients.glassCard,
};

export const SHADOWS = {
  goldGlow: shadows.premium,
  neonGlow: shadows.floating,
  violetGlow: shadows.floating,
  pinkGlow: shadows.premium,
  soft: shadows.soft,
  medium: shadows.medium,
  strong: shadows.strong,
  floating: shadows.floating,
  premium: shadows.premium,
};

export const TYPOGRAPHY = {
  h1: { ...typography.displayM, color: COLORS.textPrimary },
  h2: { ...typography.headingL, color: COLORS.textPrimary },
  h3: { ...typography.headingM, color: COLORS.textPrimary },
  h4: { ...typography.bodyLarge, fontWeight: '600' as const, color: COLORS.textPrimary },
  body: { ...typography.bodyMedium, color: COLORS.textPrimary },
  bodySecondary: { ...typography.bodyMedium, color: COLORS.textSecondary },
  caption: { ...typography.bodySmall, color: COLORS.textSecondary },
  small: { ...typography.caption, color: COLORS.textTertiary },
  label: { ...typography.label, color: COLORS.textSecondary },
};

export const SPACING = {
  xs: spacing[4],
  sm: spacing[8],
  md: spacing[16],
  lg: spacing[24],
  xl: spacing[32],
  xxl: spacing[48],
};

export const BORDER_RADIUS = {
  xs: radius.xs,
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  xxl: radius.xxl,
  full: radius.full,
};

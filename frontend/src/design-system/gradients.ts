import { colors } from './colors';

export const gradients = {
  lynkGoldPremium: [colors.brand.deepGold, colors.brand.primaryGold, colors.brand.lightGold] as const,
  lynkPurplePremium: [colors.brand.backgroundPurple, colors.brand.premiumDarkPurple, colors.brand.secondaryPurple] as const,
  lynkGoldPurpleHybrid: [colors.brand.secondaryPurple, colors.brand.primaryGold] as const,
  lynkMatchGradient: [colors.brand.lightGold, colors.semantic.success] as const,
  lynkFounderGradient: [colors.brand.primaryGold, colors.brand.lightGold, colors.brand.white] as const,
  lynkPlatinumGradient: ['#F8FAFC', '#CBD5E1', colors.brand.lightGold] as const,
  lynkDarkLuxuryGradient: [colors.brand.midnight, colors.brand.backgroundPurple, colors.brand.premiumDarkPurple] as const,
  glassCard: ['rgba(52, 16, 107, 0.82)', 'rgba(15, 6, 43, 0.94)'] as const,
} as const;

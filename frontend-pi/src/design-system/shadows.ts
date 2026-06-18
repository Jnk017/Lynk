import { colors } from './colors';

export const shadows = {
  soft: {
    shadowColor: colors.brand.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  medium: {
    shadowColor: colors.brand.midnight,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  },
  strong: {
    shadowColor: colors.brand.midnight,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 34,
    elevation: 12,
  },
  floating: {
    shadowColor: colors.brand.secondaryPurple,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
    elevation: 14,
  },
  premium: {
    shadowColor: colors.brand.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 22,
    elevation: 16,
  },
} as const;

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';
import { gradients } from './gradients';
import { animations } from './animations';
import { icons } from './icons';

export const darkTheme = {
  mode: 'dark',
  colors: { ...colors.brand, ...colors.semantic, ...colors.dark },
  spacing,
  typography,
  radius,
  shadows,
  gradients,
  animations,
  icons,
} as const;

export const lightTheme = {
  mode: 'light',
  colors: { ...colors.brand, ...colors.semantic, ...colors.light },
  spacing,
  typography,
  radius,
  shadows,
  gradients,
  animations,
  icons,
} as const;

export type LynkTheme = typeof darkTheme;
export const theme = darkTheme;

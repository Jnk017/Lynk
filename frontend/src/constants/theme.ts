export const COLORS = {
  background: '#0A0A0A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  primaryViolet: '#6C3BFF',
  electricBlue: '#00C2FF',
  neonPink: '#FF4FD8',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.1)',
  success: '#00E676',
  error: '#FF5252',
  warning: '#FFB300',
  overlay: 'rgba(0,0,0,0.7)',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.15)',
};

export const GRADIENTS = {
  primary: [COLORS.primaryViolet, COLORS.electricBlue] as const,
  gold: ['#FFD700', '#FFA500'] as const,
  neon: [COLORS.neonPink, COLORS.primaryViolet] as const,
  dark: [COLORS.background, COLORS.surface] as const,
  card: ['rgba(26,26,46,0.9)', 'rgba(10,10,26,0.95)'] as const,
};

export const SHADOWS = {
  goldGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  neonGlow: {
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  violetGlow: {
    shadowColor: '#6C3BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  pinkGlow: {
    shadowColor: '#FF4FD8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: COLORS.textPrimary },
  h2: { fontSize: 24, fontWeight: '700' as const, color: COLORS.textPrimary },
  h3: { fontSize: 20, fontWeight: '600' as const, color: COLORS.textPrimary },
  h4: { fontSize: 18, fontWeight: '600' as const, color: COLORS.textPrimary },
  body: { fontSize: 16, fontWeight: '400' as const, color: COLORS.textPrimary },
  bodySecondary: { fontSize: 16, fontWeight: '400' as const, color: COLORS.textSecondary },
  caption: { fontSize: 14, fontWeight: '400' as const, color: COLORS.textSecondary },
  small: { fontSize: 12, fontWeight: '400' as const, color: COLORS.textTertiary },
  label: { fontSize: 13, fontWeight: '500' as const, color: COLORS.textSecondary, letterSpacing: 1 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

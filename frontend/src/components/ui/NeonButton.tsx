import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

type Variant = 'primary' | 'gold' | 'neon' | 'outline' | 'ghost';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

const GRADIENT_MAP: Record<Variant, [string, string]> = {
  primary: [COLORS.primaryViolet, COLORS.electricBlue],
  gold: ['#FFD700', '#FFA500'],
  neon: [COLORS.neonPink, COLORS.primaryViolet],
  outline: ['transparent', 'transparent'],
  ghost: ['transparent', 'transparent'],
};

export function NeonButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = 'md',
}: NeonButtonProps) {
  const heights = { sm: 40, md: 52, lg: 60 };
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const shadowStyle = variant === 'gold'
    ? SHADOWS.goldGlow
    : variant === 'neon'
    ? SHADOWS.pinkGlow
    : SHADOWS.violetGlow;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.wrapper,
        { height: heights[size], opacity: disabled ? 0.5 : 1 },
        !isOutline && !isGhost && shadowStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={GRADIENT_MAP[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          isOutline && {
            borderWidth: 2,
            borderColor: COLORS.primaryViolet,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textPrimary} size="small" />
        ) : (
          <Text
            style={[
              styles.label,
              { fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16 },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.full,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

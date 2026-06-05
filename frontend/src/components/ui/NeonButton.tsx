import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, GRADIENTS, SPACING } from '../../constants/theme';

type Variant = 'primary' | 'gold' | 'neon' | 'outline' | 'ghost';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GRADIENT_MAP: Record<Variant, readonly [string, string, ...string[]]> = {
  primary: [...GRADIENTS.primary],
  gold: [...GRADIENTS.gold],
  neon: [...GRADIENTS.neon],
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
  accessibilityLabel,
  accessibilityHint,
}: NeonButtonProps) {
  const heights = { sm: 44, md: 52, lg: 60 };
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const shadowStyle = variant === 'gold'
    ? SHADOWS.goldGlow
    : variant === 'neon'
    ? SHADOWS.pinkGlow
    : SHADOWS.violetGlow;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.wrapper,
        { height: heights[size], opacity: disabled || loading ? 0.6 : 1 },
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
            borderColor: COLORS.gold,
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
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

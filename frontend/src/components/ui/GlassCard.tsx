import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderColor?: string;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  borderColor = COLORS.glassBorder,
  padding = 16,
}: GlassCardProps) {
  return (
    <View style={[styles.container, { borderColor, padding }, style]}>
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

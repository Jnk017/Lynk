import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const TIER_CONFIG = {
  bronze: {
    colors: ['#CD7F32', '#8B4513'] as const,
    label: 'Bronze',
    emoji: '🥉',
  },
  silver: {
    colors: ['#C0C0C0', '#808080'] as const,
    label: 'Silver',
    emoji: '⭐',
  },
  gold: {
    colors: ['#FFD700', '#FFA500'] as const,
    label: 'Gold',
    emoji: '🌟',
  },
  platinum: {
    colors: ['#E5E4E2', '#B0B0B0'] as const,
    label: 'Global Elite',
    emoji: '💎',
  },
};

interface SubscriptionBadgeProps {
  tier: keyof typeof TIER_CONFIG;
  size?: 'sm' | 'md';
}

export function SubscriptionBadge({ tier, size = 'md' }: SubscriptionBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  return (
    <LinearGradient
      colors={config.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, size === 'sm' && styles.badgeSm]}
    >
      <Text style={[styles.emoji, size === 'sm' && styles.emojiSm]}>{config.emoji}</Text>
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: tier === 'platinum' || tier === 'silver' ? '#0A0A0A' : '#fff' }]}>
        {config.label}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emoji: { fontSize: 12 },
  emojiSm: { fontSize: 10 },
  label: { fontSize: 12, fontWeight: '700' },
  labelSm: { fontSize: 10 },
});

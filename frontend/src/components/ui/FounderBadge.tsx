import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';

interface FounderBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export function FounderBadge({ rank, size = 'md' }: FounderBadgeProps) {
  const sizes = { sm: 20, md: 28, lg: 36 };
  const fontSizes = { sm: 8, md: 10, lg: 14 };
  const dim = sizes[size];

  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500', '#FFD700']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        { width: dim, height: dim, borderRadius: dim / 2 },
        SHADOWS.goldGlow,
      ]}
    >
      <Text style={[styles.crown, { fontSize: fontSizes[size] }]}>👑</Text>
    </LinearGradient>
  );
}

export function FounderRankBadge({ rank }: { rank: number }) {
  return (
    <View style={styles.rankBadge}>
      <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.rankGradient}>
        <Text style={styles.rankCrown}>👑</Text>
        <Text style={styles.rankText}>Founder #{rank}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crown: {
    textAlign: 'center',
  },
  rankBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  rankGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  rankCrown: {
    fontSize: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
  },
});

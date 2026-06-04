import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Href, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { FounderRankBadge } from '../../src/components/ui/FounderBadge';
import { SubscriptionBadge } from '../../src/components/ui/SubscriptionBadge';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../src/constants/theme';
import { SubscriptionTier } from '../../src/types/api';

const PROFILE_MENU_ITEMS: Array<{ icon: string; label: string; route: Href }> = [
  { icon: '🛡️', label: 'Verification & KYC', route: '/profile/verification' },
  { icon: '💎', label: 'Subscription & Plans', route: '/shop/subscription' },
  { icon: '🎁', label: 'Gift Store', route: '/shop/gifts' },
  { icon: '💍', label: 'Marriage Stake', route: '/profile/marriage' },
  { icon: '🤝', label: 'Anti-Ghosting Staking', route: '/profile/staking' },
  { icon: '⚙️', label: 'Settings', route: '/profile/settings' },
];

function isSubscriptionTier(tier: string): tier is SubscriptionTier {
  return ['bronze', 'silver', 'gold', 'platinum'].includes(tier);
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const tierBadgeStyle = user.subscriptionPlan
    ? { borderColor: user.subscriptionPlan.tierColor }
    : {};

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />

      {/* Decorative ambient glow */}
      <View style={[styles.glow]} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarBorder, tierBadgeStyle]}>
              <LinearGradient
                colors={[COLORS.primaryViolet, COLORS.electricBlue]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>{user.displayName?.[0]?.toUpperCase()}</Text>
              </LinearGradient>
            </View>

            <Text style={styles.displayName}>{user.displayName}</Text>

            <View style={styles.badgesRow}>
              {user.isFounder && user.founderRank && (
                <FounderRankBadge rank={user.founderRank} />
              )}
              {user.subscriptionPlan && (
                <SubscriptionBadge tier={isSubscriptionTier(user.subscriptionPlan.name) ? user.subscriptionPlan.name : 'bronze'} />
              )}
              {user.verificationStatus === 'verified' && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{Math.round(Number(user.trustScore))}</Text>
                <Text style={styles.statLabel}>Trust Score</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{Number(user.piBalance).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Pi Balance</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>${Number(user.fiatBalance).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Fiat Balance</Text>
              </View>
            </View>
          </GlassCard>

          {/* Founder section */}
          {user.isFounder && (
            <GlassCard style={[styles.founderCard, SHADOWS.goldGlow]}>
              <View style={styles.founderHeader}>
                <Text style={styles.founderIcon}>👑</Text>
                <View>
                  <Text style={styles.founderTitle}>Founder #{user.founderRank}</Text>
                  <Text style={styles.founderSubtitle}>
                    {user.isRevenueSharingActive
                      ? '✅ Revenue Sharing Active'
                      : '⏳ Refer 5 verified users to activate'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.referralBtn}
                onPress={() => router.push('/referral')}
              >
                <Text style={styles.referralBtnText}>View Referral Stats →</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* Menu items */}
          {PROFILE_MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}

          <NeonButton
            label="Sign Out"
            onPress={logout}
            variant="outline"
            style={{ marginTop: SPACING.xl, marginBottom: SPACING.lg }}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  glow: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.primaryViolet, opacity: 0.08 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: 20 },
  title: { ...TYPOGRAPHY.h4 },
  editText: { color: COLORS.electricBlue, fontSize: 16 },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, gap: SPACING.md },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md },
  avatarBorder: { padding: 3, borderRadius: 60, borderWidth: 2, borderColor: COLORS.glassBorder },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 42, color: '#fff', fontWeight: '700' },
  displayName: { ...TYPOGRAPHY.h2 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, justifyContent: 'center' },
  verifiedBadge: { backgroundColor: COLORS.electricBlue, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statsCard: { marginBottom: SPACING.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: '800', color: COLORS.gold },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.glassBorder },
  founderCard: { backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.3)' },
  founderHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  founderIcon: { fontSize: 36 },
  founderTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gold },
  founderSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  referralBtn: { alignSelf: 'flex-start' },
  referralBtnText: { color: COLORS.electricBlue, fontWeight: '600', fontSize: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder, gap: SPACING.md },
  menuIcon: { fontSize: 22, width: 30 },
  menuLabel: { ...TYPOGRAPHY.body, flex: 1 },
  menuArrow: { color: COLORS.textTertiary, fontSize: 16 },
});

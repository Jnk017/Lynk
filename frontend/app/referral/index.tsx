import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../src/constants/theme';

export default function ReferralScreen() {
  const { data: stats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => api.get<any>(API_ENDPOINTS.referral.stats),
  });

  const { data: distributions = [] } = useQuery({
    queryKey: ['distributions'],
    queryFn: () => api.get<any[]>(API_ENDPOINTS.referral.distributions),
  });

  const { data: pools = [] } = useQuery({
    queryKey: ['revenuePools'],
    queryFn: () => api.get<any[]>(API_ENDPOINTS.referral.pools),
  });

  const shareReferral = async () => {
    await Share.share({
      message: `Join Lynk – the premium Web3 dating app! Use my referral code ${stats?.referralCode} to register. First 2500 members become permanent Founders with 5% revenue sharing! https://lynk.app/r/${stats?.referralCode}`,
    });
  };

  const progress = stats
    ? Math.min((stats.qualifyingReferrals / 5) * 100, 100)
    : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Founder Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Founder status card */}
          {stats?.isFounder ? (
            <GlassCard style={[styles.founderCard, SHADOWS.goldGlow]}>
              <Text style={styles.founderTitle}>👑 Founder #{stats.founderRank}</Text>
              <Text style={styles.founderStatus}>
                {stats.isRevenueSharingActive
                  ? '✅ Revenue Sharing ACTIVE'
                  : `⏳ ${stats.referralsNeeded} more verified referral(s) needed`}
              </Text>

              {!stats.isRevenueSharingActive && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {stats.qualifyingReferrals} / 5 verified referrals
                  </Text>
                </View>
              )}
            </GlassCard>
          ) : (
            <GlassCard style={styles.nonFounderCard}>
              <Text style={styles.nonFounderText}>
                ⚠️ You are not a Founder. The first 2500 member spots are taken. Founding status cannot be purchased.
              </Text>
            </GlassCard>
          )}

          {/* Referral code */}
          <GlassCard>
            <Text style={styles.sectionTitle}>Your Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.referralCode}>{stats?.referralCode || '...'}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={shareReferral}>
              <LinearGradient
                colors={[COLORS.primaryViolet, COLORS.electricBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shareGradient}
              >
                <Text style={styles.shareBtnText}>📤 Share Referral Link</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>

          {/* Stats overview */}
          <GlassCard>
            <Text style={styles.sectionTitle}>Referral Stats</Text>
            {[
              { label: 'Total Referrals', value: stats?.totalReferrals || 0 },
              { label: 'Verified Referrals', value: stats?.verifiedReferrals || 0 },
              { label: 'Qualifying for Rev. Share', value: stats?.qualifyingReferrals || 0 },
            ].map((item) => (
              <View key={item.label} style={styles.statRow}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            ))}
          </GlassCard>

          {/* Revenue pools history */}
          {pools.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>Revenue Pool History</Text>
              {pools.map((pool: any) => (
                <GlassCard key={pool.id} style={{ marginBottom: SPACING.sm }}>
                  <View style={styles.poolHeader}>
                    <Text style={styles.poolPeriod}>📅 {pool.period}</Text>
                    <Text style={[styles.poolStatus, pool.status === 'completed' && { color: COLORS.success }]}>
                      {pool.status}
                    </Text>
                  </View>
                  <View style={styles.poolStats}>
                    <View style={styles.poolStat}>
                      <Text style={styles.poolStatValue}>${Number(pool.totalRevenue).toFixed(0)}</Text>
                      <Text style={styles.poolStatLabel}>Total Revenue</Text>
                    </View>
                    <View style={styles.poolStat}>
                      <Text style={styles.poolStatValue}>{pool.activeFounderCount}</Text>
                      <Text style={styles.poolStatLabel}>Active Founders</Text>
                    </View>
                    <View style={styles.poolStat}>
                      <Text style={[styles.poolStatValue, { color: COLORS.gold }]}>
                        ${Number(pool.dividendPerFounder).toFixed(2)}
                      </Text>
                      <Text style={styles.poolStatLabel}>Your Share</Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Recent distributions */}
          {distributions.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>My Distributions</Text>
              {distributions.slice(0, 5).map((dist: any) => (
                <View key={dist.id} style={styles.distRow}>
                  <View>
                    <Text style={styles.distPeriod}>{dist.pool?.period}</Text>
                    <Text style={styles.distStatus}>{dist.status}</Text>
                  </View>
                  <Text style={styles.distAmount}>+${Number(dist.amount).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: 20 },
  title: { ...TYPOGRAPHY.h4 },
  scroll: { padding: SPACING.xl, gap: SPACING.md },
  founderCard: { backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.3)', gap: SPACING.sm },
  founderTitle: { fontSize: 22, fontWeight: '900', color: COLORS.gold },
  founderStatus: { color: COLORS.textSecondary, fontSize: 14 },
  progressSection: { gap: SPACING.xs, marginTop: SPACING.sm },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 4 },
  progressText: { color: COLORS.textTertiary, fontSize: 13 },
  nonFounderCard: { borderColor: COLORS.warning },
  nonFounderText: { color: COLORS.warning, fontSize: 14, lineHeight: 22 },
  sectionTitle: { ...TYPOGRAPHY.label, marginBottom: SPACING.md },
  codeBox: { backgroundColor: COLORS.glass, borderRadius: 12, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  referralCode: { fontSize: 28, fontWeight: '900', color: COLORS.gold, letterSpacing: 4 },
  shareBtn: { borderRadius: 30, overflow: 'hidden' },
  shareGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  statLabel: { color: COLORS.textSecondary, fontSize: 15 },
  statValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  sectionHeader: { ...TYPOGRAPHY.label, marginBottom: SPACING.md, marginTop: SPACING.sm },
  poolHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  poolPeriod: { ...TYPOGRAPHY.body, fontWeight: '600' },
  poolStatus: { color: COLORS.textTertiary, fontSize: 13 },
  poolStats: { flexDirection: 'row', justifyContent: 'space-around' },
  poolStat: { alignItems: 'center' },
  poolStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  poolStatLabel: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  distPeriod: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  distStatus: { color: COLORS.textTertiary, fontSize: 12 },
  distAmount: { fontSize: 18, fontWeight: '800', color: COLORS.success },
});

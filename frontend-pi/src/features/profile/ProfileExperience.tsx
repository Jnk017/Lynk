import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, ProgressBar, Badge } from '../../components/premium';
import { theme } from '../../design-system';
import { ProfileCompletionResult } from './completion';
import { LynkProfile } from './types';

export function CompletionCard({ completion, onAction }: { completion: ProfileCompletionResult; onAction: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: completion.percentage, duration: theme.animations.duration.celebration, useNativeDriver: false }).start();
  }, [completion.percentage, progress]);
  const width = progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const next = completion.missing.slice(0, 3);
  return (
    <Card accessibilityLabel={`Profile ${completion.percentage} percent complete. Strength ${completion.strength}.`}>
      <View style={styles.completionHeader}>
        <View style={styles.scoreRing} accessibilityElementsHidden>
          <Text style={styles.score}>{completion.percentage}%</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>PROFILE STRENGTH</Text>
          <Text style={styles.heading}>{completion.strength}</Text>
          <Text style={styles.supporting}>A thoughtful profile helps compatible people understand what matters to you.</Text>
        </View>
      </View>
      <View accessibilityRole="progressbar" accessibilityLabel="Profile completion" accessibilityValue={{ min: 0, max: 100, now: completion.percentage }} style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      {next.length > 0 ? <View style={styles.actions}>
        <Text style={styles.sectionLabel}>Recommended next</Text>
        {next.map((item) => (
          <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`${item.actionLabel}, adds ${item.weight} percent`} accessibilityHint="Opens the profile editor" onPress={onAction} style={styles.actionRow}>
            <View style={styles.actionMark}><Text style={styles.actionMarkText}>+</Text></View>
            <Text style={styles.actionText}>{item.actionLabel}</Text>
            <Text style={styles.weight}>+{item.weight}%</Text>
          </Pressable>
        ))}
      </View> : <View style={styles.completeMessage}><Text style={styles.completeTitle}>Your profile is complete</Text><Text style={styles.supporting}>Keep it current as your life and intentions evolve.</Text></View>}
    </Card>
  );
}

export function TrustBadgeRow({ profile, completion }: { profile: LynkProfile; completion: ProfileCompletionResult }) {
  const badges: Array<{ label: string; tone: 'gold' | 'success' | 'neutral' }> = [];
  if (profile.verificationStatus === 'verified') badges.push({ label: 'Verified identity', tone: 'success' });
  if (profile.livenessVideoUrl || profile.verificationStatus === 'verified') badges.push({ label: 'Verified selfie', tone: 'success' });
  if (completion.percentage === 100) badges.push({ label: 'Profile complete', tone: 'gold' });
  if (profile.isFounder) badges.push({ label: profile.founderRank ? `Founder · ${profile.founderRank}` : 'Founder', tone: 'gold' });
  if (profile.subscriptionPlan?.name === 'gold') badges.push({ label: 'Gold member', tone: 'gold' });
  if (profile.subscriptionPlan?.name === 'platinum') badges.push({ label: 'Platinum member', tone: 'neutral' });
  if (!badges.length) badges.push({ label: 'Building trust', tone: 'neutral' });
  return <View accessibilityLabel={`Trust indicators: ${badges.map((badge) => badge.label).join(', ')}`} style={styles.badges}>{badges.map((badge) => <Badge key={badge.label} label={badge.label} tone={badge.tone} />)}</View>;
}

export function InsightsCard({ completion, verified }: { completion: ProfileCompletionResult; verified: boolean }) {
  const insights: string[] = [];
  if (completion.sections.find((item) => item.key === 'photo')?.complete) insights.push('Your profile photo gives people a confident first impression.');
  if (!completion.sections.find((item) => item.key === 'interests')?.complete) insights.push('A few interests can create easier conversation starters.');
  if (!completion.sections.find((item) => item.key === 'relationshipGoals')?.complete) insights.push('Sharing your relationship goals can improve compatibility.');
  if (!verified) insights.push('Verification may help your profile feel safer and more trustworthy.');
  if (!insights.length) insights.push('Your profile communicates strong intention and care.');
  return <Card accessibilityLabel="Profile quality insights"><Text style={styles.eyebrow}>PROFILE INSIGHTS</Text><Text style={styles.cardTitle}>Your strongest next moves</Text><View style={styles.insightList}>{insights.slice(0, 3).map((insight) => <View key={insight} style={styles.insightRow}><Text style={styles.spark}>✦</Text><Text style={styles.insightText}>{insight}</Text></View>)}</View></Card>;
}

export function ProfileSectionCard({ title, value, emptyText, icon, onPress, actionLabel }: { title: string; value?: string; emptyText: string; icon: string; onPress: () => void; actionLabel?: string }) {
  const isEmpty = !value;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${value || emptyText}`} accessibilityHint={`Opens ${title.toLowerCase()} editing`} onPress={onPress}>
    <LinearGradient colors={theme.gradients.glassCard} style={styles.sectionCard}>
      <View style={styles.sectionIcon}><Text style={styles.sectionIconText}>{icon}</Text></View>
      <View style={styles.flex}><Text style={styles.sectionTitle}>{title}</Text><Text numberOfLines={2} style={isEmpty ? styles.emptyText : styles.sectionValue}>{value || emptyText}</Text>{isEmpty ? <Text style={styles.addText}>{actionLabel ?? `Add ${title.toLowerCase()}`}  →</Text> : null}</View>
      <Text accessibilityElementsHidden style={styles.chevron}>›</Text>
    </LinearGradient>
  </Pressable>;
}

export function VerificationSummary({ progress, status, onPress }: { progress: number; status: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Verification progress ${progress} percent. Status ${status}`} accessibilityHint="Opens verification center" onPress={onPress}>
    <LinearGradient colors={theme.gradients.lynkGoldPurpleHybrid} style={styles.verificationCard}>
      <View style={styles.verificationTop}><View><Text style={styles.verificationEyebrow}>TRUST LEVEL</Text><Text style={styles.verificationTitle}>{status}</Text></View><Text style={styles.shield}>◇</Text></View>
      <ProgressBar progress={progress / 100} label={`Verification ${progress} percent complete`} />
      <View style={styles.verificationBottom}><Text style={styles.verificationCopy}>{progress === 100 ? 'Your trust signals are active.' : 'Complete your trust profile securely.'}</Text><Text style={styles.verificationLink}>View verification →</Text></View>
    </LinearGradient>
  </Pressable>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, completionHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[16] }, scoreRing: { width: theme.spacing[64], height: theme.spacing[64], borderRadius: theme.radius.full, borderWidth: 2, borderColor: theme.colors.lightGold, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceSoft }, score: { ...theme.typography.headingM, color: theme.colors.lightGold }, eyebrow: { ...theme.typography.caption, color: theme.colors.lightGold }, heading: { ...theme.typography.headingM, color: theme.colors.textPrimary, marginTop: theme.spacing[4] }, supporting: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, progressTrack: { height: theme.spacing[8], borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceSoft, overflow: 'hidden', marginTop: theme.spacing[16] }, progressFill: { height: '100%', borderRadius: theme.radius.full, backgroundColor: theme.colors.lightGold }, actions: { marginTop: theme.spacing[16], gap: theme.spacing[8] }, sectionLabel: { ...theme.typography.label, color: theme.colors.textSecondary }, actionRow: { minHeight: theme.spacing[40], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }, actionMark: { width: theme.spacing[24], height: theme.spacing[24], borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceSoft }, actionMarkText: { color: theme.colors.lightGold, fontWeight: '700' }, actionText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, flex: 1 }, weight: { ...theme.typography.caption, color: theme.colors.lightGold, fontWeight: '700' }, completeMessage: { marginTop: theme.spacing[16] }, completeTitle: { ...theme.typography.bodyLarge, color: theme.colors.lightGold }, badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing[8] }, cardTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary, marginTop: theme.spacing[4] }, insightList: { marginTop: theme.spacing[12], gap: theme.spacing[12] }, insightRow: { flexDirection: 'row', gap: theme.spacing[12], alignItems: 'flex-start' }, spark: { color: theme.colors.lightGold }, insightText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, flex: 1 }, sectionCard: { borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing[16], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }, sectionIcon: { width: theme.spacing[40], height: theme.spacing[40], borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }, sectionIconText: { fontSize: theme.typography.headingM.fontSize }, sectionTitle: { ...theme.typography.label, color: theme.colors.textPrimary }, sectionValue: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, emptyText: { ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginTop: theme.spacing[4] }, addText: { ...theme.typography.caption, color: theme.colors.lightGold, marginTop: theme.spacing[8] }, chevron: { ...theme.typography.headingL, color: theme.colors.textTertiary }, verificationCard: { borderRadius: theme.radius.xl, padding: theme.spacing[16], gap: theme.spacing[16], ...theme.shadows.premium }, verificationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, verificationEyebrow: { ...theme.typography.caption, color: theme.colors.white }, verificationTitle: { ...theme.typography.headingM, color: theme.colors.white, marginTop: theme.spacing[4] }, shield: { fontSize: theme.typography.displayM.fontSize, color: theme.colors.lightGold }, verificationBottom: { gap: theme.spacing[4] }, verificationCopy: { ...theme.typography.bodySmall, color: theme.colors.white }, verificationLink: { ...theme.typography.label, color: theme.colors.lightGold },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../src/components/premium';
import { theme } from '../../src/design-system';
import { MilestoneGrid, SectionHeading } from '../../src/features/commitment/CommitmentExperience';
import type { Milestone } from '../../src/features/commitment/CommitmentExperience';
import { CommitmentScreen } from '../../src/features/commitment/screen';
import { calculateProfileCompletion } from '../../src/features/profile/completion';
import { useProfile } from '../../src/features/profile/useProfile';
import { trackFrontendEvent } from '../../src/services/observability';

export default function CommitmentWalletScreen() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  if (isLoading) return <CommitmentScreen title="Commitment Wallet"><LoadingState label="Preparing your commitments" /></CommitmentScreen>;
  if (isError || !profile) return <CommitmentScreen title="Commitment Wallet"><ErrorState title="We could not load your commitments" description="Please try again in a moment." onRetry={() => void refetch()} /></CommitmentScreen>;
  const completion = calculateProfileCompletion(profile);
  const dateCommitments = profile.dateCommitments ?? [];
  const active = dateCommitments.filter((item) => item.status === 'active' || item.status === 'confirmed');
  const completed = dateCommitments.filter((item) => item.status === 'completed');
  const marriageStatus = profile.marriageCommitment?.status;
  const milestones: Milestone[] = [
    { key: 'match', title: 'First Match', description: 'The beginning of a mutual connection.', state: marriageStatus ? 'unlocked' : 'in_progress' },
    { key: 'verified', title: 'Verified Profile', description: 'Identity signals strengthen community trust.', state: profile.verificationStatus === 'verified' ? 'unlocked' : 'in_progress' },
    { key: 'created', title: 'Commitment Created', description: 'A shared intention becomes visible.', state: marriageStatus ? ['matched', 'relationship_started'].includes(marriageStatus) ? 'in_progress' : 'unlocked' : 'locked' },
    { key: 'proof', title: 'Proof Submitted', description: 'Marriage documentation enters review.', state: marriageStatus && ['proof_submitted', 'review', 'confirmed', 'released'].includes(marriageStatus) ? 'unlocked' : marriageStatus === 'active' ? 'in_progress' : 'locked' },
    { key: 'married', title: 'Marriage Confirmed', description: 'A shared lifetime milestone is verified.', state: marriageStatus && ['confirmed', 'released'].includes(marriageStatus) ? 'unlocked' : marriageStatus === 'review' ? 'in_progress' : 'locked' },
  ];
  const unlocked = milestones.filter((item) => item.state === 'unlocked').length;
  return <CommitmentScreen title="Commitment Wallet" eyebrow="RELATIONSHIP COMMITMENTS">
    <View accessible accessibilityRole="header"><Text style={styles.heroTitle}>Promises with purpose.</Text><Text style={styles.heroBody}>A calm home for the commitments, progress and milestones you share. This is about presence and trust—not trading or speculation.</Text></View>
    <Card accessibilityLabel={`${active.length} active commitments. ${completed.length} completed commitments.`}><Text style={styles.overline}>CURRENT COMMITMENT</Text><View style={styles.summaryRow}><View><Text style={styles.summaryValue}>{active.length}</Text><Text style={styles.summaryLabel}>Active</Text></View><View style={styles.divider} /><View><Text style={styles.summaryValue}>{completed.length}</Text><Text style={styles.summaryLabel}>Completed</Text></View><View style={styles.divider} /><View><Text style={styles.summaryValue}>{unlocked}/{milestones.length}</Text><Text style={styles.summaryLabel}>Milestones</Text></View></View></Card>

    <SectionHeading eyebrow="TOGETHER NOW" title="Active commitments" />
    {active.length ? active.map((item) => <Card key={item.id} accessibilityLabel={`Active commitment with ${item.partnerName ?? 'your partner'}`}><View style={styles.cardTop}><View style={styles.flex}><Text style={styles.cardTitle}>{item.partnerName ? `With ${item.partnerName}` : 'Shared date commitment'}</Text><Text style={styles.body}>{[item.dateScheduledAt ? new Date(item.dateScheduledAt).toLocaleDateString() : undefined, item.dateLocation].filter(Boolean).join(' · ') || 'Details are shared privately between both partners.'}</Text></View><Badge label={item.status === 'confirmed' ? 'Confirmed' : 'Active'} tone="gold" /></View><Text style={styles.progressCopy}>Shared confirmation</Text><ProgressBar progress={(Number(item.creatorConfirmed) + Number(item.partnerConfirmed)) / 2} label="Shared attendance confirmation progress" /></Card>) : <Card><EmptyState title="No active commitments" description="When you and a partner choose a shared commitment, it will appear here with clear next steps." /></Card>}

    <SectionHeading eyebrow="YOUR PROGRESS" title="Relationship milestones" description="Milestones recognize meaningful progress without competition, streaks or public rankings." />
    <MilestoneGrid milestones={milestones} onViewed={(milestone) => void trackFrontendEvent('milestone_viewed', profile.id, { milestone: milestone.key, state: milestone.state })} />

    <SectionHeading eyebrow="PAST MOMENTS" title="History" />
    {dateCommitments.length ? dateCommitments.map((item) => <Card key={item.id} accessibilityLabel={`${item.status} commitment ${item.partnerName ? `with ${item.partnerName}` : ''}`}><View style={styles.cardTop}><View style={styles.flex}><Text style={styles.cardTitle}>{item.partnerName ? `With ${item.partnerName}` : 'Shared commitment'}</Text><Text style={styles.body}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Date not available'}</Text></View><Badge label={item.status.replace(/\b\w/g, (letter) => letter.toUpperCase())} tone={item.status === 'completed' ? 'success' : item.status === 'cancelled' ? 'neutral' : 'purple'} /></View></Card>) : <Card><EmptyState title="No history yet" description="Your past commitments will form a private record of reliability and shared follow-through." /></Card>}
    <Card accessibilityLabel={`Profile readiness ${completion.percentage} percent`}><Text style={styles.cardTitle}>Readiness foundation</Text><Text style={styles.body}>A complete, verified profile helps partners begin from a place of clarity.</Text><View style={styles.progressSpace}><ProgressBar progress={completion.percentage / 100} label={`Profile readiness ${completion.percentage} percent`} /></View></Card>
  </CommitmentScreen>;
}

const styles = StyleSheet.create({ heroTitle: { ...theme.typography.displayM, color: theme.colors.textPrimary }, heroBody: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary, marginTop: theme.spacing[12] }, overline: { ...theme.typography.caption, color: theme.colors.lightGold }, summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: theme.spacing[16] }, summaryValue: { ...theme.typography.headingL, color: theme.colors.lightGold, textAlign: 'center' }, summaryLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, divider: { width: 1, height: theme.spacing[40], backgroundColor: theme.colors.borderSubtle }, cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[12] }, flex: { flex: 1 }, cardTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, body: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, progressCopy: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing[16], marginBottom: theme.spacing[8] }, progressSpace: { marginTop: theme.spacing[16] } });

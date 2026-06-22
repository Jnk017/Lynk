import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, ErrorState, LoadingState } from '../../src/components/premium';
import { theme } from '../../src/design-system';
import { CommitmentScoreCard, CommitmentTimeline, PartnerCommitmentCard, SectionHeading, Celebration, ActionCard } from '../../src/features/commitment/CommitmentExperience';
import { buildJourney, calculateCommitmentScore, getSharedProgress } from '../../src/features/commitment/model';
import { CommitmentScreen } from '../../src/features/commitment/screen';
import { calculateProfileCompletion } from '../../src/features/profile/completion';
import { useProfile } from '../../src/features/profile/useProfile';
import { trackFrontendEvent } from '../../src/services/observability';

const celebrationCopy = {
  commitment_created: ['Commitment created', 'A meaningful intention is now part of your shared journey.'],
  proof_submitted: ['Proof submitted', 'Your documents were received and are ready for careful review.'],
  confirmed: ['Marriage confirmed', 'Your shared milestone has been verified with care.'],
  released: ['Commitment released', 'Your visible commitment journey is complete.'],
} as const;

export default function MarriageCommitmentCenter() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  useEffect(() => { if (profile) void trackFrontendEvent('commitment_center_opened', profile.id, { hasCommitment: Boolean(profile.marriageCommitment) }); }, [profile]);
  useEffect(() => {
    const status = profile?.marriageCommitment?.status;
    if (profile && status === 'commitment_created') void trackFrontendEvent('commitment_created_viewed', profile.id, { commitmentId: profile.marriageCommitment?.id });
    if (profile && status === 'proof_submitted') void trackFrontendEvent('proof_submission_completed', profile.id, { commitmentId: profile.marriageCommitment?.id });
  }, [profile]);
  if (isLoading) return <CommitmentScreen title="Commitment Center"><LoadingState label="Preparing your commitment journey" /></CommitmentScreen>;
  if (isError || !profile) return <CommitmentScreen title="Commitment Center"><ErrorState title="We could not load your commitment center" description="Your relationship information is safe. Please try again." onRetry={() => void refetch()} /></CommitmentScreen>;

  const completion = calculateProfileCompletion(profile);
  const commitment = profile.marriageCommitment;
  const score = calculateCommitmentScore(profile, completion);
  const timeline = buildJourney(commitment?.status);
  const celebration = commitment?.status ? celebrationCopy[commitment.status as keyof typeof celebrationCopy] : profile.verificationStatus === 'verified' ? ['Verification approved', 'Your verified identity adds a trusted foundation to future commitments.'] as const : undefined;
  const sharedProgress = getSharedProgress(profile, completion.percentage);

  const beginProofPreparation = () => {
    void trackFrontendEvent('proof_submission_started', profile.id, { commitmentId: commitment?.id, source: 'commitment_center' });
    router.push('/profile/marriage/benefits');
  };

  return <CommitmentScreen title="Commitment Center">
    <View accessible accessibilityRole="header"><Text style={styles.heroEyebrow}>MARRIAGE COMMITMENT</Text><Text style={styles.heroTitle}>A visible path toward a shared future.</Text><Text style={styles.heroBody}>Marriage Staking is Lynk’s commitment mechanism: a clear, mutual journey that helps couples express serious intent and track meaningful relationship stages. It is not an investment or a game.</Text></View>
    {celebration ? <Celebration title={celebration[0]} description={celebration[1]} /> : null}
    <CommitmentScoreCard score={score} />

    <SectionHeading eyebrow="UNDERSTAND" title="What is Marriage Staking?" />
    <Card accessibilityLabel="Marriage Staking explanation"><Text style={styles.cardTitle}>Commitment, made clear</Text><Text style={styles.body}>It gives both partners a shared structure for expressing intent, preparing for marriage verification and seeing what comes next. Any existing commitment terms remain unchanged; this center simply makes the journey understandable.</Text><Pressable accessibilityRole="link" accessibilityLabel="Learn why commitment matters" accessibilityHint="Opens educational commitment benefits" onPress={() => router.push('/profile/marriage/benefits')} style={styles.link}><Text style={styles.linkText}>Why commitment matters</Text><Text style={styles.chevron}>›</Text></Pressable></Card>

    <SectionHeading eyebrow="MY STATUS" title="My commitment status" description="Your current stage and the next meaningful step." />
    <Card accessibilityLabel={`Commitment status ${commitment ? formatStatus(commitment.status) : 'not started'}`}><View style={styles.statusRow}><View style={styles.statusIcon}><Text style={styles.statusIconText}>♡</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{commitment ? formatStatus(commitment.status) : 'No commitment yet'}</Text><Text style={styles.body}>{commitment ? 'Your relationship journey is visible below.' : 'When a relationship is ready, you can create a shared commitment without pressure.'}</Text></View><Badge label={commitment ? 'In journey' : 'Not started'} tone={commitment ? 'gold' : 'neutral'} /></View><Pressable accessibilityRole="button" accessibilityLabel="Open commitment checkout" onPress={() => router.push('/checkout?type=staking&amount=25')} style={styles.link}><Text style={styles.linkText}>Fund commitment</Text><Text style={styles.chevron}>›</Text></Pressable></Card>

    <SectionHeading eyebrow="TOGETHER" title="Partner status" />
    <PartnerCommitmentCard partner={commitment?.partner} sharedProgress={sharedProgress} />

    <SectionHeading eyebrow="SHARED JOURNEY" title="Progress timeline" description="Every stage is shown as completed, current or upcoming." />
    <CommitmentTimeline stages={timeline} />

    <SectionHeading eyebrow="NEXT STEP" title="Required actions" />
    {!commitment ? <ActionCard title="Build readiness first" description="Complete your profile and verification, then focus on finding a relationship with shared intent." label={completion.percentage < 100 ? 'Strengthen my profile' : 'Explore meaningful matches'} onPress={() => router.push(completion.percentage < 100 ? '/profile/edit' : '/match/discovery')} /> : commitment.status === 'active' ? <ActionCard title="Prepare for proof when the time is right" description="Review what marriage proof means before beginning. Nothing is submitted from this educational step." label="Understand proof submission" onPress={beginProofPreparation} /> : <ActionCard title="Stay aligned together" description="There is no action required right now. Review your shared timeline for the next stage." label="View commitment history" onPress={() => router.push('/profile/marriage/history')} />}

    <SectionHeading eyebrow="PURPOSE" title="Commitment benefits" />
    <View style={styles.benefitGrid}>{[['Trust', 'Make serious intent easier to understand.'], ['Clarity', 'See where your shared journey stands.'], ['Planning', 'Prepare thoughtfully for long-term milestones.'], ['Readiness', 'Build confidence through profile and identity signals.']].map(([title, copy]) => <Card key={title} style={styles.benefitCard} accessibilityLabel={`${title}. ${copy}`}><Text style={styles.benefitIcon}>◇</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.body}>{copy}</Text></Card>)}</View>

    <Pressable accessibilityRole="button" accessibilityLabel="Open commitment history" accessibilityHint="Shows the private record of commitment changes" onPress={() => router.push('/profile/marriage/history')}><Card><View style={styles.link}><View style={styles.flex}><Text style={styles.cardTitle}>Commitment history</Text><Text style={styles.body}>Review created, active, proof, release or cancellation events.</Text></View><Text style={styles.chevron}>›</Text></View></Card></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Open relationship milestones" accessibilityHint="Shows visual relationship milestones" onPress={() => router.push('/profile/staking')}><Card><View style={styles.link}><View style={styles.flex}><Text style={styles.cardTitle}>Commitment Wallet & milestones</Text><Text style={styles.body}>See active commitments and the moments that shape your journey.</Text></View><Text style={styles.chevron}>›</Text></View></Card></Pressable>
  </CommitmentScreen>;
}

function formatStatus(status: string) { return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const styles = StyleSheet.create({ heroEyebrow: { ...theme.typography.caption, color: theme.colors.lightGold, letterSpacing: 1 }, heroTitle: { ...theme.typography.displayM, color: theme.colors.textPrimary, marginTop: theme.spacing[8] }, heroBody: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary, marginTop: theme.spacing[12] }, cardTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, body: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, link: { minHeight: theme.spacing[48], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing[12], gap: theme.spacing[12] }, linkText: { ...theme.typography.label, color: theme.colors.lightGold }, chevron: { ...theme.typography.headingL, color: theme.colors.lightGold }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }, statusIcon: { width: theme.spacing[48], height: theme.spacing[48], borderRadius: theme.radius.full, backgroundColor: theme.colors.secondaryPurple, alignItems: 'center', justifyContent: 'center' }, statusIconText: { ...theme.typography.headingM, color: theme.colors.lightGold }, flex: { flex: 1 }, benefitGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -theme.spacing[4] }, benefitCard: { width: '48%', minWidth: 140, flexGrow: 1, margin: theme.spacing[4], minHeight: 150 }, benefitIcon: { ...theme.typography.headingM, color: theme.colors.lightGold } });

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../src/components/premium';
import { theme } from '../../../src/design-system';
import { SectionHeading } from '../../../src/features/commitment/CommitmentExperience';
import { CommitmentScreen } from '../../../src/features/commitment/screen';
import { useAuth } from '../../../src/providers/AuthProvider';
import { trackFrontendEvent } from '../../../src/services/observability';

const topics = [
  { icon: '◇', title: 'Trust', body: 'Visible intent and verified identity signals help both people understand the foundation they are building.' },
  { icon: '♡', title: 'Intentional dating', body: 'Commitment creates space for honest conversations about what each partner wants—without rushing the relationship.' },
  { icon: '◎', title: 'Relationship clarity', body: 'A shared timeline makes the current stage and next step understandable to both partners.' },
  { icon: '⌁', title: 'Long-term planning', body: 'Milestones can support thoughtful conversations about values, timing, family and a life together.' },
  { icon: '✦', title: 'Marriage readiness', body: 'Profile completion, verification and relationship progress provide a calm view of readiness—not a judgment of personal worth.' },
];

export default function CommitmentBenefitsScreen() {
  const { user } = useAuth();
  useEffect(() => { if (user) void trackFrontendEvent('commitment_benefits_opened', user.id); }, [user]);
  return <CommitmentScreen title="Why Commitment Matters">
    <View accessible accessibilityRole="header"><Text style={styles.heroTitle}>Serious love deserves clarity.</Text><Text style={styles.heroBody}>Lynk’s commitment experience helps couples express intent, understand shared progress and prepare for meaningful long-term decisions.</Text></View>
    <SectionHeading eyebrow="THE PURPOSE" title="More than a status" description="Commitment is a mutual conversation supported by trustworthy signals and a visible journey." />
    {topics.map((topic) => <Card key={topic.title} accessibilityLabel={`${topic.title}. ${topic.body}`}><View style={styles.topicRow}><View style={styles.icon}><Text style={styles.iconText}>{topic.icon}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{topic.title}</Text><Text style={styles.body}>{topic.body}</Text></View></View></Card>)}
    <Card accessibilityLabel="Commitment principles"><Text style={styles.cardTitle}>Designed with care</Text><Text style={styles.body}>This experience does not promise financial returns, influence matching, create public rankings or pressure couples into a timeline. Your relationship moves at the pace you choose together.</Text></Card>
  </CommitmentScreen>;
}
const styles = StyleSheet.create({ heroTitle: { ...theme.typography.displayM, color: theme.colors.textPrimary }, heroBody: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary, marginTop: theme.spacing[12] }, topicRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[12] }, icon: { width: theme.spacing[48], height: theme.spacing[48], borderRadius: theme.radius.full, backgroundColor: theme.colors.secondaryPurple, alignItems: 'center', justifyContent: 'center' }, iconText: { ...theme.typography.headingM, color: theme.colors.lightGold }, flex: { flex: 1 }, cardTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, body: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] } });

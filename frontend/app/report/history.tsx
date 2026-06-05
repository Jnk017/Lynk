import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { SafetyReport } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';

export default function ReportHistoryScreen() {
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery<SafetyReport[]>({ queryKey: ['my-reports'], queryFn: () => api.get<SafetyReport[]>(API_ENDPOINTS.moderation.myReports) });
  return <View style={styles.container}><LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} /><SafeAreaView style={{ flex: 1 }}><View style={styles.header}><Text style={styles.back} onPress={() => router.back()}>←</Text><Text style={styles.title}>Report History</Text><View style={{ width: 24 }} /></View><ScrollView contentContainerStyle={styles.scroll}>{isLoading ? <Text style={styles.muted}>Loading reports...</Text> : null}{isError ? <GlassCard style={styles.errorCard}><Text style={styles.error}>{getErrorMessage(error, 'Unable to load reports.')}</Text><NeonButton label="Retry" onPress={() => refetch()} loading={isFetching} variant="outline" /></GlassCard> : null}{!isError && !data.length ? <Text style={styles.muted}>No reports submitted.</Text> : data.map((report) => <GlassCard key={report.id} style={styles.card}><Text style={styles.section}>{report.reason.replace(/_/g, ' ')}</Text><Text style={styles.muted}>Status: {report.status}</Text><Text style={styles.muted}>{new Date(report.createdAt).toLocaleString()}</Text></GlassCard>)}</ScrollView></SafeAreaView></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: COLORS.background }, header: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.xl }, back: { color: COLORS.textSecondary, fontSize: 20 }, title: { ...TYPOGRAPHY.h3 }, scroll: { padding: SPACING.xl, gap: SPACING.md }, card: { gap: SPACING.sm }, section: { ...TYPOGRAPHY.h4, textTransform: 'capitalize' }, muted: { ...TYPOGRAPHY.bodySecondary }, error: { color: COLORS.error }, errorCard: { borderColor: COLORS.error, gap: SPACING.md } });

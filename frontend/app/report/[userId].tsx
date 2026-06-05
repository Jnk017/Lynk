import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { getErrorMessage } from '../../src/utils/errors';
import { useAuth } from '../../src/providers/AuthProvider';
import { trackFrontendEvent } from '../../src/services/observability';

const reasons = ['fake_account', 'harassment', 'spam', 'inappropriate_content'];

export default function ReportUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const mutation = useMutation({ mutationFn: () => api.post(API_ENDPOINTS.moderation.reports, { reportedUserId: userId, reason, details }), onSuccess: () => { setSubmitted(true); if (user?.id) void trackFrontendEvent('report_submitted', user.id, { reason }); } });
  return <View style={styles.container}><LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} /><SafeAreaView style={{ flex: 1 }}><View style={styles.header}><Text style={styles.back} onPress={() => router.back()}>←</Text><Text style={styles.title}>Report User</Text><View style={{ width: 24 }} /></View><ScrollView contentContainerStyle={styles.scroll}>{submitted ? <GlassCard style={styles.card}><Text style={styles.big}>✅</Text><Text style={styles.section}>Report submitted</Text><Text style={styles.muted}>Our moderation team will review this report.</Text><NeonButton label="View Report History" onPress={() => router.replace('/report/history')} /></GlassCard> : <GlassCard style={styles.card}><Text style={styles.section}>Why are you reporting this user?</Text>{reasons.map((item) => <TouchableOpacity key={item} style={[styles.option, reason === item && styles.optionActive]} onPress={() => setReason(item)}><Text style={styles.optionText}>{item.replace(/_/g, ' ')}</Text></TouchableOpacity>)}<TextInput style={styles.input} value={details} onChangeText={setDetails} placeholder="Add details for moderators" placeholderTextColor={COLORS.textTertiary} multiline />{mutation.error ? <Text style={styles.error}>{getErrorMessage(mutation.error, 'Unable to submit report.')}</Text> : null}<NeonButton label="Submit Report" onPress={() => mutation.mutate()} loading={mutation.isPending} variant="neon" /></GlassCard>}</ScrollView></SafeAreaView></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: COLORS.background }, header: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.xl }, back: { color: COLORS.textSecondary, fontSize: 20 }, title: { ...TYPOGRAPHY.h3 }, scroll: { padding: SPACING.xl, gap: SPACING.md }, card: { gap: SPACING.md, alignItems: 'stretch' }, big: { fontSize: 56, textAlign: 'center' }, section: { ...TYPOGRAPHY.h4, textAlign: 'center' }, muted: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center' }, option: { padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder }, optionActive: { borderColor: COLORS.electricBlue, backgroundColor: COLORS.glass }, optionText: { color: COLORS.textPrimary, textTransform: 'capitalize' }, input: { minHeight: 100, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 12, padding: SPACING.md, textAlignVertical: 'top' }, error: { color: COLORS.error, textAlign: 'center' } });

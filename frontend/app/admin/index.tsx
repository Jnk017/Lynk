import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { AuthenticatedUserProfile, SafetyReport } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';

export default function AdminPanelScreen() {
  const [search, setSearch] = useState('');
  const users = useQuery<AuthenticatedUserProfile[]>({ queryKey: ['admin-users'], queryFn: () => api.get<AuthenticatedUserProfile[]>(API_ENDPOINTS.admin.users) });
  const reports = useQuery<SafetyReport[]>({ queryKey: ['admin-reports'], queryFn: () => api.get<SafetyReport[]>(API_ENDPOINTS.admin.reports) });
  const pending = useQuery<AuthenticatedUserProfile[]>({ queryKey: ['admin-verifications'], queryFn: () => api.get<AuthenticatedUserProfile[]>(API_ENDPOINTS.admin.pendingVerifications) });
  const suspend = useMutation({ mutationFn: (id: string) => api.patch(API_ENDPOINTS.admin.suspend(id), { reason: 'Admin action from mobile panel' }), onSuccess: async () => users.refetch() });
  const restore = useMutation({ mutationFn: (id: string) => api.patch(API_ENDPOINTS.admin.restore(id), {}), onSuccess: async () => users.refetch() });
  const approve = useMutation({ mutationFn: (id: string) => api.patch(API_ENDPOINTS.admin.approveVerification(id), {}), onSuccess: async () => pending.refetch() });
  const reject = useMutation({ mutationFn: (id: string) => api.patch(API_ENDPOINTS.admin.rejectVerification(id), {}), onSuccess: async () => pending.refetch() });
  const resolve = useMutation({ mutationFn: (id: string) => api.patch(API_ENDPOINTS.admin.resolveReport(id), { status: 'resolved', resolution: 'Reviewed in alpha admin panel' }), onSuccess: async () => reports.refetch() });
  const filteredUsers = useMemo(() => (users.data || []).filter((u) => `${u.displayName} ${u.email}`.toLowerCase().includes(search.toLowerCase())), [users.data, search]);
  const apiError = users.error || reports.error || pending.error;
  return <View style={styles.container}><LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} /><SafeAreaView style={{ flex: 1 }}><View style={styles.header}><Text style={styles.back} onPress={() => router.back()}>←</Text><Text style={styles.title}>Admin MVP</Text><View style={{ width: 24 }} /></View><ScrollView contentContainerStyle={styles.scroll}>{apiError ? <Text style={styles.error}>{getErrorMessage(apiError, 'Admin API unavailable or current user is not an admin.')}</Text> : null}<GlassCard style={styles.card}><Text style={styles.section}>Users</Text><TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search users" placeholderTextColor={COLORS.textTertiary} />{filteredUsers.slice(0, 20).map((u) => <View key={u.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{u.displayName || u.email || u.id}</Text><Text style={styles.muted}>{u.verificationStatus} · {u.isFounder ? 'Founder' : 'User'}</Text></View><NeonButton label="Suspend" onPress={() => suspend.mutate(u.id)} size="sm" variant="neon" /><NeonButton label="Restore" onPress={() => restore.mutate(u.id)} size="sm" variant="outline" /></View>)}</GlassCard><GlassCard style={styles.card}><Text style={styles.section}>Reports</Text>{reports.data?.filter((r) => r.status !== 'resolved').slice(0, 20).map((r) => <View key={r.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{r.reason}</Text><Text style={styles.muted}>{r.status}</Text></View><NeonButton label="Resolve" onPress={() => resolve.mutate(r.id)} size="sm" /></View>)}</GlassCard><GlassCard style={styles.card}><Text style={styles.section}>Pending Verification</Text>{pending.data?.slice(0, 20).map((u) => <View key={u.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{u.displayName || u.id}</Text><Text style={styles.muted}>{u.verificationStatus}</Text></View><NeonButton label="Approve" onPress={() => approve.mutate(u.id)} size="sm" /><NeonButton label="Reject" onPress={() => reject.mutate(u.id)} size="sm" variant="outline" /></View>)}</GlassCard></ScrollView></SafeAreaView></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: COLORS.background }, header: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.xl }, back: { color: COLORS.textSecondary, fontSize: 20 }, title: { ...TYPOGRAPHY.h3 }, scroll: { padding: SPACING.xl, gap: SPACING.md }, card: { gap: SPACING.md }, section: { ...TYPOGRAPHY.h4 }, input: { borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 12, padding: SPACING.md, color: COLORS.textPrimary }, row: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder, paddingVertical: SPACING.sm }, name: { ...TYPOGRAPHY.body, fontWeight: '700' }, muted: { ...TYPOGRAPHY.caption }, error: { color: COLORS.error, textAlign: 'center' } });

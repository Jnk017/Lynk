import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../design-system';

export function CommitmentScreen({ title, eyebrow = 'LYNK COMMITMENT', children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return <View style={styles.container}><LinearGradient colors={theme.gradients.lynkDarkLuxuryGradient} style={StyleSheet.absoluteFill} /><View style={styles.goldGlow} /><SafeAreaView style={styles.safeArea}><View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to the previous screen" onPress={() => router.back()} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable><View style={styles.headerCenter}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View><View style={styles.backButton} /></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, safeArea: { flex: 1 }, goldGlow: { position: 'absolute', top: -80, right: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: theme.colors.deepGold, opacity: 0.1 }, header: { minHeight: theme.spacing[64], paddingHorizontal: theme.spacing[16], flexDirection: 'row', alignItems: 'center' }, backButton: { width: theme.spacing[48], minHeight: theme.spacing[48], justifyContent: 'center' }, back: { ...theme.typography.headingL, color: theme.colors.textPrimary }, headerCenter: { flex: 1, alignItems: 'center' }, eyebrow: { ...theme.typography.caption, color: theme.colors.textTertiary }, title: { ...theme.typography.headingM, color: theme.colors.textPrimary, textAlign: 'center' }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: theme.spacing[16], paddingBottom: theme.spacing[64], gap: theme.spacing[16] } });

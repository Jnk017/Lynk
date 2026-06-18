import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../../src/components/premium';
import { theme } from '../../../src/design-system';

const BENEFITS = [
  ['Higher visibility', 'Verified trust signals can help your profile stand out with confidence.'],
  ['More trust', 'People can feel more certain that you are who you say you are.'],
  ['Better matches', 'Authenticity supports more intentional, compatible introductions.'],
  ['Safer community', 'Verification strengthens accountability across every connection.'],
  ['Premium badge', 'A refined verification mark appears with your profile trust signals.'],
] as const;

export default function VerificationBenefitsScreen() {
  return <View style={styles.container}><LinearGradient colors={theme.gradients.lynkDarkLuxuryGradient} style={StyleSheet.absoluteFill} /><SafeAreaView style={styles.safeArea}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to verification" onPress={() => router.back()} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>Why verify?</Text><View style={styles.backButton} /></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View accessibilityRole="header" style={styles.hero}><LinearGradient colors={theme.gradients.lynkGoldPremium} style={styles.emblem}><Text style={styles.emblemText}>◇</Text></LinearGradient><Text style={styles.eyebrow}>CONFIDENCE BY DESIGN</Text><Text style={styles.title}>Trust makes room for something real.</Text><Text style={styles.subtitle}>Verification is a private, secure way to signal authenticity—and help every Lynk begin from a stronger place.</Text></View>
      <View style={styles.benefits}>{BENEFITS.map(([title, description], index) => <Card key={title} accessibilityLabel={`${title}. ${description}`}><View style={styles.benefitRow}><Text style={styles.number}>0{index + 1}</Text><View style={styles.flex}><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View></View></Card>)}</View>
      <Card accessibilityLabel="Verification progress overview"><Text style={styles.eyebrow}>YOUR PATH</Text><View style={styles.path}><View style={styles.pathNode}><Text style={styles.pathNumber}>1</Text></View><View style={styles.pathLine} /><View style={styles.pathNode}><Text style={styles.pathNumber}>3</Text></View><View style={styles.pathLine} /><View style={styles.pathNode}><Text style={styles.pathNumber}>5</Text></View></View><View style={styles.pathLabels}><Text style={styles.pathLabel}>Contact</Text><Text style={styles.pathLabel}>Identity</Text><Text style={styles.pathLabel}>Selfie</Text></View></Card>
      <Button label="Continue verification" variant="premiumGold" onPress={() => router.back()} accessibilityHint="Returns to your verification steps" />
      <Text style={styles.privacy}>Your identity document and selfie are never shown publicly.</Text>
    </ScrollView>
  </SafeAreaView></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, safeArea: { flex: 1 }, flex: { flex: 1 }, header: { minHeight: theme.spacing[64], paddingHorizontal: theme.spacing[16], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backButton: { width: theme.spacing[48], minHeight: theme.spacing[48], justifyContent: 'center' }, back: { ...theme.typography.headingL, color: theme.colors.textPrimary }, headerTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary }, content: { padding: theme.spacing[16], paddingBottom: theme.spacing[48], gap: theme.spacing[16] }, hero: { alignItems: 'center', paddingVertical: theme.spacing[24] }, emblem: { width: theme.spacing[64], height: theme.spacing[64], borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing[16], ...theme.shadows.premium }, emblemText: { ...theme.typography.displayM, color: theme.colors.premiumDarkPurple }, eyebrow: { ...theme.typography.caption, color: theme.colors.lightGold }, title: { ...theme.typography.displayM, color: theme.colors.textPrimary, textAlign: 'center', marginTop: theme.spacing[8] }, subtitle: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing[12] }, benefits: { gap: theme.spacing[12] }, benefitRow: { flexDirection: 'row', gap: theme.spacing[16] }, number: { ...theme.typography.caption, color: theme.colors.lightGold, marginTop: theme.spacing[4] }, benefitTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, description: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, path: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing[16] }, pathNode: { width: theme.spacing[40], height: theme.spacing[40], borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.lightGold, backgroundColor: theme.colors.surfaceSoft }, pathNumber: { ...theme.typography.label, color: theme.colors.lightGold }, pathLine: { flex: 1, height: 1, backgroundColor: theme.colors.border }, pathLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[8] }, pathLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, width: theme.spacing[64], textAlign: 'center' }, privacy: { ...theme.typography.caption, color: theme.colors.textTertiary, textAlign: 'center' } });

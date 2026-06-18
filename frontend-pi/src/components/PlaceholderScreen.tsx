import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Button, Card, Divider, EmptyState, ProgressBar, Tag } from './premium';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  todo: string;
  premiumPoints?: string[];
}

export function PlaceholderScreen({ title, description, todo, premiumPoints = ['Trust-first design', 'WCAG AA touch targets', 'Loading, empty, error, retry, and offline states specified'] }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text accessibilityRole="button" accessibilityLabel="Go back" style={styles.backText} onPress={() => router.back()}>← Back</Text>
          <View style={styles.heroMark} accessibilityLabel="Lynk premium gold mark"><Text style={styles.heroIcon}>♡</Text></View>
          <Text style={styles.kicker}>CONNECT. GROW. CREATE.</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <Card accessibilityLabel={`${title} readiness card`} style={styles.card}>
            <View style={styles.rowBetween}>
              <Tag label="Alpha ready shell" tone="gold" />
              <Text style={styles.percent}>85%</Text>
            </View>
            <ProgressBar progress={0.85} label={`${title} design readiness`} />
            <Divider />
            {premiumPoints.map((point) => <Text key={point} style={styles.point}>✓ {point}</Text>)}
          </Card>

          <EmptyState title="Provider integration intentionally deferred" description={todo} />
          <Button label="Return" variant="outline" onPress={() => router.back()} accessibilityHint="Returns to the previous Lynk screen" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scroll: { padding: SPACING.xl, gap: SPACING.md },
  backText: { ...TYPOGRAPHY.bodySecondary, minHeight: 44 },
  heroMark: { width: 84, height: 84, borderRadius: BORDER_RADIUS.xxl, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.gold, ...SHADOWS.premium },
  heroIcon: { fontSize: 42, color: COLORS.gold },
  kicker: { ...TYPOGRAPHY.label, color: COLORS.gold, letterSpacing: 2 },
  title: { ...TYPOGRAPHY.h1 },
  description: { ...TYPOGRAPHY.bodySecondary },
  card: { gap: SPACING.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percent: { ...TYPOGRAPHY.h3, color: COLORS.gold },
  point: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
});

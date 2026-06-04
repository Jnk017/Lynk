import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { GlassCard } from './ui/GlassCard';
import { NeonButton } from './ui/NeonButton';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  todo: string;
}

export function PlaceholderScreen({ title, description, todo }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.backText} onPress={() => router.back()}>← Back</Text>
        </View>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.todo}>TODO: {todo}</Text>
          <NeonButton label="Return" variant="outline" onPress={() => router.back()} style={styles.button} />
        </GlassCard>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, padding: SPACING.xl },
  header: { marginBottom: SPACING.xl },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  card: { gap: SPACING.md },
  title: { ...TYPOGRAPHY.h2 },
  description: { ...TYPOGRAPHY.bodySecondary, lineHeight: 22 },
  todo: { ...TYPOGRAPHY.caption, color: COLORS.warning, lineHeight: 20 },
  button: { marginTop: SPACING.md },
});

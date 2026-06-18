import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../design-system';

export function SafetyScreen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.premiumDarkPurple]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to the previous screen" hitSlop={12} onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function SafetyCard({ icon, title, description, onPress }: { icon: string; title: string; description: string; onPress?: () => void }) {
  const content = <><Text style={styles.cardIcon}>{icon}</Text><View style={styles.cardCopy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardDescription}>{description}</Text></View>{onPress ? <Text style={styles.arrow}>›</Text> : null}</>;
  if (!onPress) return <View accessible accessibilityLabel={`${title}. ${description}`} style={styles.card}>{content}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={description} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>{content}</Pressable>;
}

export const safetyStyles = StyleSheet.create({
  sectionTitle: { color: theme.colors.lightGold, fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 8 },
  body: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 },
  note: { color: theme.colors.textTertiary, fontSize: 13, lineHeight: 19 },
  stack: { gap: 12 },
});

const styles = StyleSheet.create({
  root: { flex: 1 }, safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSoft },
  backText: { color: theme.colors.lightGold, fontSize: 32, lineHeight: 34 }, heading: { flex: 1, paddingTop: 2 },
  title: { color: theme.colors.textPrimary, fontSize: 26, lineHeight: 32, fontWeight: '800' }, subtitle: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 4 },
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: 14 },
  card: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  pressed: { opacity: 0.76 }, cardIcon: { fontSize: 26, width: 34, textAlign: 'center' }, cardCopy: { flex: 1, gap: 4 },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '700' }, cardDescription: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 }, arrow: { color: theme.colors.primaryGold, fontSize: 28 },
});

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Entrance, ProgressBar, Tag } from '../../src/components/premium';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';

const slides = [
  { word: 'CONNECT', title: 'Meaningful relationships.', body: 'Meet people who value trust, intention, and real commitment.', icon: '♡' },
  { word: 'GROW', title: 'Build strong connections.', body: 'Use prompts, values, and goals to develop something deeper than a match.', icon: '✦' },
  { word: 'CREATE', title: 'Create a future together.', body: 'Move from discovery to readiness with marriage-minded experiences.', icon: '∞' },
  { word: 'JOURNEY', title: 'Choose your journey', body: 'Tell Lynk what kind of connection you want right now.', icon: '◌' },
  { word: 'ACCOUNT', title: 'Create Account', body: 'Your premium Lynk profile is the start of intentional connection.', icon: '✓' },
] as const;

const journeys = ['Dating', 'Serious Relationship', 'Marriage', 'Networking'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [journey, setJourney] = useState(journeys[1]);
  const progress = useMemo(() => (step + 1) / slides.length, [step]);
  const slide = slides[step];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (step === 0 ? router.back() : setStep(step - 1))} style={styles.headerButton}>
            <Text style={styles.headerText}>{step === 0 ? 'Close' : 'Back'}</Text>
          </Pressable>
          <Text style={styles.stepText}>{step + 1} / {slides.length}</Text>
        </View>
        <ProgressBar progress={progress} label="Onboarding progress" />

        <Entrance key={slide.word}>
          <View style={styles.content}>
            <View style={styles.illustration} accessibilityLabel={`${slide.word} premium illustration`}>
              <View style={styles.orbitOne} />
              <View style={styles.orbitTwo} />
              <Text style={styles.icon}>{slide.icon}</Text>
            </View>
            <Text style={styles.word}>{slide.word}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>

            {step === 3 ? (
              <Card style={styles.journeyCard} accessibilityLabel="Choose your Lynk journey">
                {journeys.map((item) => (
                  <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: journey === item }} onPress={() => setJourney(item)} style={[styles.journeyOption, journey === item && styles.journeySelected]}>
                    <Text style={[styles.journeyText, journey === item && styles.journeySelectedText]}>{item}</Text>
                    {journey === item ? <Tag label="Selected" tone="gold" /> : null}
                  </Pressable>
                ))}
              </Card>
            ) : null}

            {step === 4 ? (
              <Card style={styles.promiseCard} accessibilityLabel="Lynk relationship promise">
                <Text style={styles.promiseTitle}>Built for commitment, not casual swiping.</Text>
                <Text style={styles.promiseBody}>Your selected journey: {journey}. You can update this anytime from Profile.</Text>
              </Card>
            ) : null}
          </View>
        </Entrance>

        <View style={styles.footer}>
          <Button label={step === slides.length - 1 ? 'Create Account' : 'Continue'} variant="premiumGold" onPress={next} accessibilityHint="Moves to the next onboarding step" />
          <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => router.push('/auth/register')} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, padding: SPACING.xl, gap: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { minHeight: 44, justifyContent: 'center' },
  headerText: { ...TYPOGRAPHY.bodySecondary },
  stepText: { ...TYPOGRAPHY.label, color: COLORS.gold },
  content: { alignItems: 'center', gap: SPACING.md, paddingTop: SPACING.xl },
  illustration: { width: 180, height: 180, borderRadius: BORDER_RADIUS.xxl, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.gold, ...SHADOWS.premium },
  orbitOne: { position: 'absolute', width: 138, height: 138, borderRadius: 69, borderWidth: 1, borderColor: COLORS.border, transform: [{ rotate: '24deg' }] },
  orbitTwo: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: COLORS.border, transform: [{ rotate: '-18deg' }] },
  icon: { fontSize: 72, color: COLORS.gold },
  word: { ...TYPOGRAPHY.label, color: COLORS.gold, letterSpacing: 3, marginTop: SPACING.md },
  title: { ...TYPOGRAPHY.h1, textAlign: 'center' },
  body: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center' },
  journeyCard: { width: '100%', gap: SPACING.sm, marginTop: SPACING.md },
  journeyOption: { minHeight: 52, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  journeySelected: { backgroundColor: COLORS.glass, borderColor: COLORS.gold },
  journeyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  journeySelectedText: { color: COLORS.textPrimary, fontWeight: '700' },
  promiseCard: { gap: SPACING.sm, marginTop: SPACING.md },
  promiseTitle: { ...TYPOGRAPHY.h3 },
  promiseBody: { ...TYPOGRAPHY.caption },
  footer: { marginTop: 'auto', gap: SPACING.sm },
  skipButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skipText: { ...TYPOGRAPHY.caption },
});

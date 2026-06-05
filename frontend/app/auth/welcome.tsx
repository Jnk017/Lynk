import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Tag } from '../../src/components/premium';
import { BORDER_RADIUS, COLORS, GRADIENTS, SHADOWS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 360 });
  }, [fadeIn]);

  const entranceStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.content, entranceStyle]}>
            <View style={styles.brandBlock}>
              <View style={styles.logoFrame}>
                <Image
                  source={require('../../assets/icon.png')}
                  resizeMode="cover"
                  style={styles.logo}
                  accessibilityLabel="Lynk logo"
                />
              </View>
              <Text accessibilityRole="header" style={styles.appName}>LYNK</Text>
              <Text style={styles.slogan}>CONNECT. GROW. CREATE.</Text>
            </View>

            <View style={styles.heroCopy}>
              <Tag label="Relationships with intention" tone="gold" />
              <Text style={styles.title}>Connection that is built to last.</Text>
              <Text style={styles.description}>
                Meet people who value trust, growth, community, and a meaningful future together.
              </Text>
            </View>

            <Card style={styles.trustCard} accessibilityLabel="Lynk trust promise">
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>✓</Text>
                <View style={styles.trustCopy}>
                  <Text style={styles.trustTitle}>Intentional profiles</Text>
                  <Text style={styles.trustText}>Goals and values come before casual swiping.</Text>
                </View>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>♡</Text>
                <View style={styles.trustCopy}>
                  <Text style={styles.trustTitle}>A safer way to connect</Text>
                  <Text style={styles.trustText}>Trust signals help every introduction feel more considered.</Text>
                </View>
              </View>
            </Card>

            <View style={styles.actions}>
              <Button
                label="Create Account"
                variant="premiumGold"
                onPress={() => router.push('/auth/register')}
                accessibilityHint="Opens account registration"
              />
              <Button
                label="Sign In"
                variant="outline"
                onPress={() => router.push('/auth/login')}
                accessibilityHint="Opens account sign in"
              />
              <Button
                label="Continue with Pi"
                variant="ghost"
                onPress={() => router.push('/auth/pi-auth')}
                accessibilityHint="Opens the Pi authentication information screen"
              />
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to Lynk's Terms of Service and Privacy Policy.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: 520, flexGrow: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, gap: SPACING.xl },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: BORDER_RADIUS.full },
  glowTop: { top: -120, right: -100, backgroundColor: COLORS.primaryViolet, opacity: 0.26 },
  glowBottom: { bottom: -140, left: -100, backgroundColor: COLORS.gold, opacity: 0.08 },
  brandBlock: { alignItems: 'center', gap: SPACING.sm },
  logoFrame: { width: 96, height: 96, borderRadius: BORDER_RADIUS.xxl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gold, ...SHADOWS.premium },
  logo: { width: '100%', height: '100%' },
  appName: { ...TYPOGRAPHY.h1, color: COLORS.textPrimary, letterSpacing: 8, marginLeft: 8 },
  slogan: { ...TYPOGRAPHY.label, color: COLORS.gold, letterSpacing: 2 },
  heroCopy: { alignItems: 'center', gap: SPACING.md },
  title: { ...TYPOGRAPHY.h1, textAlign: 'center' },
  description: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center' },
  trustCard: { gap: SPACING.md },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  trustIcon: { width: 32, color: COLORS.gold, fontSize: 24, textAlign: 'center' },
  trustCopy: { flex: 1, gap: SPACING.xs },
  trustTitle: { ...TYPOGRAPHY.h4 },
  trustText: { ...TYPOGRAPHY.caption },
  actions: { gap: SPACING.md, marginTop: 'auto' },
  terms: { ...TYPOGRAPHY.small, textAlign: 'center', color: COLORS.textTertiary },
});

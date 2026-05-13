import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

function AnimatedLogo() {
  const pulse = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
    rotation.value = withRepeat(withTiming(360, { duration: 8000 }), -1, false);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pulse.value, [0, 1], [1, 1.05], Extrapolate.CLAMP),
      },
    ],
    shadowOpacity: interpolate(pulse.value, [0, 1], [0.4, 0.8], Extrapolate.CLAMP),
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.logoContainer}>
      <Animated.View style={[styles.orbitRing, orbitStyle]} />
      <Animated.View style={[styles.logoCircle, logoStyle]}>
        <LinearGradient
          colors={[COLORS.primaryViolet, COLORS.electricBlue]}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoText}>∞</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

export default function WelcomeScreen() {
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1200 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#0D0D1A', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative ambient glows */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, containerStyle]}>
          <AnimatedLogo />

          <View style={styles.textSection}>
            <Text style={styles.appName}>LYNK</Text>
            <Text style={styles.slogan}>Connect. Grow. Create.</Text>
            <Text style={styles.description}>
              The first Web3 premium dating experience.{'\n'}
              Made for the global African diaspora.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>2500</Text>
              <Text style={styles.statLabel}>Founder Spots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>5%</Text>
              <Text style={styles.statLabel}>Revenue Share</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>Web3</Text>
              <Text style={styles.statLabel}>Pi Network</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <NeonButton
              label="Create Account"
              onPress={() => router.push('/auth/register')}
              variant="primary"
              size="lg"
            />
            <NeonButton
              label="Sign In"
              onPress={() => router.push('/auth/login')}
              variant="outline"
              size="lg"
              style={{ marginTop: SPACING.md }}
            />
            <TouchableOpacity
              style={styles.piButton}
              onPress={() => router.push('/auth/pi-auth')}
            >
              <Text style={styles.piText}>🥧 Continue with Pi Network</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  glowTop: { top: -100, left: -80, backgroundColor: COLORS.primaryViolet, opacity: 0.12 },
  glowBottom: { bottom: -80, right: -60, backgroundColor: COLORS.electricBlue, opacity: 0.1 },
  logoContainer: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: COLORS.primaryViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 15,
  },
  logoGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 48, color: '#fff', fontWeight: '300' },
  orbitRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: COLORS.electricBlue,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  textSection: { alignItems: 'center', gap: SPACING.sm },
  appName: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: 12 },
  slogan: { ...TYPOGRAPHY.h3, color: COLORS.electricBlue, letterSpacing: 3, textAlign: 'center' },
  description: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center', lineHeight: 22, marginTop: SPACING.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glass, borderRadius: 16, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: COLORS.glassBorder },
  stat: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: '800', color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.glassBorder },
  buttons: { width: '100%' },
  piButton: { marginTop: SPACING.md, alignItems: 'center', padding: SPACING.md, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', backgroundColor: 'rgba(255,215,0,0.05)' },
  piText: { color: COLORS.gold, fontWeight: '600', fontSize: 16 },
  terms: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'center', lineHeight: 16 },
});

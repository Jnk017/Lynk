import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../src/constants/theme';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { PublicProfile, ProfileMedia } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';
import { FounderBadge } from '../../src/components/ui/FounderBadge';
import { SubscriptionBadge } from '../../src/components/ui/SubscriptionBadge';
import { useAuth } from '../../src/providers/AuthProvider';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.35;
const CARD_WIDTH = width - SPACING.xl * 2;

function SwipeCard({ user: profile, onSwipe }: { user: PublicProfile; onSwipe: (direction: 'left' | 'right' | 'up') => void }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
      rotation.value = (e.translationX / SWIPE_THRESHOLD) * 15;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width * 1.5, {}, () => runOnJS(onSwipe)('right'));
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width * 1.5, {}, () => runOnJS(onSwipe)('left'));
      } else if (e.translationY < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-height, {}, () => runOnJS(onSwipe)('up'));
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const superLikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const photos = profile.media?.filter((m: ProfileMedia) => m.type === 'photo') || [];
  const mainPhoto = photos[photoIndex]?.url;
  const age = profile.birthdate
    ? Math.floor((Date.now() - new Date(profile.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle, SHADOWS.violetGlow]}>
        {mainPhoto ? (
          <Image source={{ uri: mainPhoto }} style={styles.cardImage} />
        ) : (
          <LinearGradient
            colors={[COLORS.surface, COLORS.primaryViolet]}
            style={styles.cardImage}
          />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.cardOverlay}
        />

        {photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {photos.map((_: ProfileMedia, i: number) => (
              <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                <View style={[styles.dot, i === photoIndex && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LIKE / NOPE / SUPER badges */}
        <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
          <Text style={styles.likeBadgeText}>LIKE 💚</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.nopeBadge, nopeStyle]}>
          <Text style={styles.nopeBadgeText}>NOPE ✕</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.superBadge, superLikeStyle]}>
          <Text style={styles.superBadgeText}>⭐ SUPER</Text>
        </Animated.View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {profile.displayName}{age ? `, ${age}` : ''}
            </Text>
            {profile.verificationStatus === 'verified' && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
            {profile.isFounder && profile.founderRank && (
              <FounderBadge rank={profile.founderRank} size="sm" />
            )}
          </View>

          {profile.location?.city && (
            <Text style={styles.locationText}>📍 {profile.location.city}</Text>
          )}

          {profile.bio ? (
            <Text style={styles.bioText} numberOfLines={2}>{profile.bio}</Text>
          ) : null}

          {profile.subscriptionPlan && (
            <SubscriptionBadge tier={profile.subscriptionPlan.name} size="sm" />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PublicProfile[]>({
    queryKey: ['discovery'],
    queryFn: () => api.get<PublicProfile[]>(API_ENDPOINTS.matching.discovery),
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetId, action }: { targetId: string; action: string }) =>
      api.post(API_ENDPOINTS.matching.swipe(targetId), { action }),
  });

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      const profile = profiles[currentIndex];
      if (!profile) return;

      const action = direction === 'right' ? 'like' : direction === 'up' ? 'super_like' : 'dislike';
      swipeMutation.mutate(
        { targetId: profile.id, action },
        { onError: () => setCurrentIndex((i) => Math.max(0, i - 1)) },
      );
      setCurrentIndex((i) => i + 1);
    },
    [profiles, currentIndex],
  );

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.avatarSmall}>
              <Text>👤</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>LYNK</Text>
            {user?.isFounder && user.founderRank && (
              <FounderBadge rank={user.founderRank} size="sm" />
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/chat')}>
            <Text style={styles.iconButton}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* Mode selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeBtn, styles.modeBtnActive]}>
            <Text style={[styles.modeText, styles.modeTextActive]}>Swipe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn} onPress={() => router.push('/match/discovery')}>
            <Text style={styles.modeText}>Discovery 📹</Text>
          </TouchableOpacity>
        </View>

        {/* Cards stack */}
        <View style={styles.cardStack}>
          {isLoading ? (
            <View style={[styles.card, styles.loadingCard]}>
              <Text style={{ color: COLORS.textSecondary }}>Loading profiles...</Text>
            </View>
          ) : isError ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={styles.emptyTitle}>Unable to load profiles</Text>
              <Text style={styles.emptySubtitle}>{getErrorMessage(error, 'Please check your connection and try again.')}</Text>
              <NeonButton label="Retry" onPress={() => refetch()} loading={isFetching} variant="outline" style={{ marginTop: SPACING.md }} />
            </GlassCard>
          ) : !currentProfile ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={styles.emptyTitle}>You've seen everyone!</Text>
              <Text style={styles.emptySubtitle}>Check back later for new profiles in your area.</Text>
            </GlassCard>
          ) : (
            <>
              {profiles[currentIndex + 1] && (
                <View style={[styles.card, styles.cardBehind]}>
                  <LinearGradient colors={[COLORS.surface, COLORS.background]} style={{ flex: 1, borderRadius: 20 }} />
                </View>
              )}
              <SwipeCard
                key={currentProfile.id}
                user={currentProfile}
                onSwipe={handleSwipe}
              />
            </>
          )}
        </View>

        {swipeMutation.isError && (
          <Text style={styles.actionError}>Swipe failed. Please try again.</Text>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.nopeBtn]}
            onPress={() => handleSwipe('left')}
          >
            <Text style={{ fontSize: 26 }}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.superLikeBtn]}
            onPress={() => handleSwipe('up')}
          >
            <Text style={{ fontSize: 22 }}>⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn]}
            onPress={() => handleSwipe('right')}
          >
            <Text style={{ fontSize: 26 }}>💚</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  logoSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  iconButton: { fontSize: 24 },
  modeSelector: { flexDirection: 'row', marginHorizontal: SPACING.xl, marginBottom: SPACING.md, backgroundColor: COLORS.glass, borderRadius: 20, padding: 4, borderWidth: 1, borderColor: COLORS.glassBorder },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs, borderRadius: 18 },
  modeBtnActive: { backgroundColor: COLORS.primaryViolet },
  modeText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  modeTextActive: { color: '#fff' },
  cardStack: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: CARD_WIDTH,
    height: height * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
  },
  cardBehind: { transform: [{ scale: 0.95 }, { translateY: 10 }], zIndex: 0 },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { ...TYPOGRAPHY.h3, fontWeight: '700' },
  verifiedBadge: { backgroundColor: COLORS.electricBlue, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, fontSize: 12, color: '#fff', fontWeight: '700' },
  locationText: { color: COLORS.textSecondary, fontSize: 14 },
  bioText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  photoIndicators: { position: 'absolute', top: SPACING.md, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 20 },
  badge: { position: 'absolute', top: 40, borderWidth: 3, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  likeBadge: { left: 20, transform: [{ rotate: '-15deg' }], borderColor: '#00E676' },
  nopeBadge: { right: 20, transform: [{ rotate: '15deg' }], borderColor: COLORS.error },
  superBadge: { alignSelf: 'center', top: 30, borderColor: '#FFD700' },
  likeBadgeText: { color: '#00E676', fontWeight: '900', fontSize: 20 },
  nopeBadgeText: { color: COLORS.error, fontWeight: '900', fontSize: 20 },
  superBadgeText: { color: '#FFD700', fontWeight: '900', fontSize: 20 },
  loadingCard: { backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { width: CARD_WIDTH, padding: SPACING.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { ...TYPOGRAPHY.h3, textAlign: 'center', marginBottom: SPACING.sm },
  emptySubtitle: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center', lineHeight: 22 },
  actionError: { color: COLORS.error, textAlign: 'center', marginBottom: SPACING.sm },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: SPACING.xl, gap: SPACING.xl },
  actionBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  nopeBtn: { borderColor: COLORS.error, backgroundColor: 'rgba(255,82,82,0.1)' },
  likeBtn: { borderColor: '#00E676', backgroundColor: 'rgba(0,230,118,0.1)', width: 72, height: 72, borderRadius: 36 },
  superLikeBtn: { borderColor: COLORS.gold, backgroundColor: 'rgba(255,215,0,0.1)' },
});

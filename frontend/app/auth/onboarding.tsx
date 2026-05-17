import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const LIFESTYLE_TAGS = [
  { key: 'zodiac', label: '♈ Zodiac', options: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] },
  { key: 'religion', label: '🙏 Religion', options: ['Christian','Muslim','Catholic','Protestant','Atheist','Agnostic','Other'] },
  { key: 'children', label: '👶 Children', options: ['Want kids','Don\'t want kids','Have kids','Open to it'] },
  { key: 'smoking', label: '🚬 Smoking', options: ['Never','Occasionally','Socially','Yes'] },
  { key: 'height', label: '📏 Height', options: ['<160cm','160-170cm','170-180cm','180-190cm','>190cm'] },
  { key: 'education', label: '🎓 Education', options: ['High School','Bachelor\'s','Master\'s','PhD','Vocational'] },
  { key: 'relationship', label: '💕 Seeking', options: ['Serious relationship','Casual','Friendship','Marriage'] },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [selectedTags, setSelectedTags] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([]);
  const progress = useSharedValue(0);

  const goNext = async () => {
    if (step === TOTAL_STEPS - 1) {
      await saveProfile();
      return;
    }
    progress.value = withTiming((step + 1) / (TOTAL_STEPS - 1), { duration: 400 });
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) { router.back(); return; }
    progress.value = withTiming((step - 1) / (TOTAL_STEPS - 1), { duration: 400 });
    setStep((s) => s - 1);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev.slice(0, 5), result.assets[0].uri]);
    }
  };

  const toggleTag = (category: string, value: string) => {
    setSelectedTags((prev) => ({ ...prev, [category]: value }));
  };

  const saveProfile = async () => {
    try {
      const tags = Object.entries(selectedTags).map(([key, value]) => ({ key, value }));
      await api.patch(API_ENDPOINTS.users.updateMe, { lifestyleTags: tags, bio });
      router.replace('/home');
    } catch {
      router.replace('/home');
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100], Extrapolate.CLAMP)}%`,
  }));

  const steps = [
    { title: 'Add your best photos', subtitle: 'Upload up to 6 photos. Your first photo is your main profile photo.' },
    { title: 'Tell your story', subtitle: 'A great bio helps others connect with you. Be authentic!' },
    { title: 'Your lifestyle', subtitle: 'Add lifestyle tags to help find your perfect match.' },
    { title: 'Your prompts', subtitle: 'Answer 3 prompts (Hinge-style) to show your personality.' },
    { title: 'You\'re almost there! 🎉', subtitle: 'Review your profile and get ready to connect.' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backText}>{step > 0 ? '← Back' : '✕'}</Text>
          </TouchableOpacity>
          <Text style={styles.stepLabel}>{step + 1} / {TOTAL_STEPS}</Text>
        </View>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{steps[step].title}</Text>
          <Text style={styles.subtitle}>{steps[step].subtitle}</Text>

          {step === 0 && (
            <View style={styles.photosGrid}>
              {[...Array(6)].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoSlot}
                  onPress={i <= photos.length ? pickImage : undefined}
                >
                  {photos[i] ? (
                    <Image source={{ uri: photos[i] }} style={styles.photo} />
                  ) : (
                    <LinearGradient colors={['rgba(108,59,255,0.2)', 'rgba(0,194,255,0.1)']} style={styles.photoPlaceholder}>
                      <Text style={{ fontSize: 28 }}>+</Text>
                      <Text style={{ color: COLORS.textTertiary, fontSize: 11, marginTop: 4 }}>Photo {i + 1}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 1 && (
            <GlassCard style={{ marginTop: SPACING.lg }}>
              <View style={styles.textareaContainer}>
                <Text style={styles.textareaText} onPress={() => {}}>
                  {bio || 'Tap to write your bio...'}
                </Text>
                <Text style={styles.charCount}>{bio.length}/500</Text>
              </View>
            </GlassCard>
          )}

          {step === 2 && (
            <View style={{ marginTop: SPACING.lg }}>
              {LIFESTYLE_TAGS.map((category) => (
                <View key={category.key} style={{ marginBottom: SPACING.lg }}>
                  <Text style={styles.tagCategory}>{category.label}</Text>
                  <View style={styles.tagOptions}>
                    {category.options.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => toggleTag(category.key, opt)}
                        style={[
                          styles.tag,
                          selectedTags[category.key] === opt && styles.tagSelected,
                        ]}
                      >
                        <Text style={[styles.tagText, selectedTags[category.key] === opt && styles.tagTextSelected]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={{ marginTop: SPACING.lg, gap: SPACING.md }}>
              {['The most spontaneous thing I\'ve done is...', 'My go-to conversation starter is...', 'I\'m looking for someone who...'].map((q, i) => (
                <GlassCard key={i}>
                  <Text style={styles.promptQuestion}>{q}</Text>
                  <Text style={styles.promptAnswer}>{prompts[i]?.answer || 'Tap to answer...'}</Text>
                </GlassCard>
              ))}
            </View>
          )}

          {step === 4 && (
            <GlassCard style={{ marginTop: SPACING.lg }}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>📸 Photos</Text>
                <Text style={styles.reviewValue}>{photos.length} added</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>📝 Bio</Text>
                <Text style={styles.reviewValue}>{bio ? '✅ Added' : '⚠️ Missing'}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>🏷️ Tags</Text>
                <Text style={styles.reviewValue}>{Object.keys(selectedTags).length} selected</Text>
              </View>
            </GlassCard>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <NeonButton
            label={step === TOTAL_STEPS - 1 ? 'Launch My Profile 🚀' : 'Continue →'}
            onPress={goNext}
            size="lg"
            variant={step === TOTAL_STEPS - 1 ? 'gold' : 'primary'}
            style={{ marginHorizontal: SPACING.xl }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  stepLabel: { color: COLORS.textTertiary, fontSize: 14 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: SPACING.xl, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primaryViolet, borderRadius: 2 },
  content: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.bodySecondary, lineHeight: 22 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xl },
  photoSlot: { width: (width - SPACING.xl * 2 - SPACING.sm * 2) / 3, aspectRatio: 3/4, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: 'dashed', borderRadius: 12 },
  textareaContainer: { minHeight: 150 },
  textareaText: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 24 },
  charCount: { textAlign: 'right', color: COLORS.textTertiary, fontSize: 12, marginTop: SPACING.sm },
  tagCategory: { ...TYPOGRAPHY.label, marginBottom: SPACING.sm },
  tagOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tag: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: 20, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  tagSelected: { backgroundColor: COLORS.primaryViolet, borderColor: COLORS.primaryViolet },
  tagText: { color: COLORS.textSecondary, fontSize: 14 },
  tagTextSelected: { color: '#fff', fontWeight: '600' },
  promptQuestion: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  promptAnswer: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 22 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  reviewLabel: { color: COLORS.textSecondary, fontSize: 15 },
  reviewValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  footer: { paddingBottom: SPACING.lg },
});

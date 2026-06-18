import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, ErrorState, LoadingState, ProgressBar, Badge } from '../../src/components/premium';
import { theme } from '../../src/design-system';
import { getVerificationLevels, VerificationState } from '../../src/features/profile/verification';
import { profileQueryKey, useProfile } from '../../src/features/profile/useProfile';
import { API_ENDPOINTS } from '../../src/constants/api';
import { api } from '../../src/services/api';
import { getErrorMessage } from '../../src/utils/errors';

const statusPresentation: Record<VerificationState, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  approved: { label: 'Approved', tone: 'success' }, pending: { label: 'Pending review', tone: 'warning' }, needsAction: { label: 'Needs action', tone: 'neutral' },
};

export default function VerificationScreen() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([Animated.timing(pulse, { toValue: 1.04, duration: theme.animations.duration.slow, useNativeDriver: true }), Animated.spring(pulse, { toValue: 1, useNativeDriver: true })]).start();
  }, [profile?.verificationStatus, pulse]);

  const submission = useMutation({
    mutationFn: ({ endpoint, field, asset }: { endpoint: string; field: string; asset: ImagePicker.ImagePickerAsset }) => {
      const body = new FormData();
      body.append(field, { uri: asset.uri, name: asset.fileName ?? `${field}.jpg`, type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
      return api.post(endpoint, body, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      Alert.alert('Submitted securely', 'Your verification progress has been updated. Reviews are handled with care.');
    },
    onError: (error) => Alert.alert('Submission needs attention', getErrorMessage(error)),
  });

  const chooseDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false });
    if (!result.canceled) submission.mutate({ endpoint: API_ENDPOINTS.verification.kyc, field: 'document', asset: result.assets[0] });
  };
  const captureSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Camera access needed', 'Allow camera access in Settings to complete your live selfie.');
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], cameraType: ImagePicker.CameraType.front, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) submission.mutate({ endpoint: API_ENDPOINTS.verification.liveness, field: 'image', asset: result.assets[0] });
  };

  if (isLoading) return <Screen><LoadingState label="Opening your trust center" /></Screen>;
  if (isError || !profile) return <Screen><ErrorState title="Verification is temporarily unavailable" description="No information was changed. Please try again." onRetry={() => void refetch()} /></Screen>;
  const levels = getVerificationLevels(profile);
  const approved = levels.filter((level) => level.state === 'approved').length;
  const progress = approved / levels.length;
  const hasDocument = Boolean(profile.kycDocumentUrl);
  const verified = profile.verificationStatus === 'verified';

  return <Screen>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to profile" onPress={() => router.back()} style={styles.headerAction}><Text style={styles.back}>‹</Text></Pressable><View style={styles.headerCenter}><Text style={styles.overline}>LYNK TRUST</Text><Text style={styles.headerTitle}>Verification</Text></View><View style={styles.headerAction} /></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient accessibilityRole="summary" accessibilityLabel={`Trust level ${approved} of ${levels.length}`} colors={theme.gradients.lynkGoldPurpleHybrid} style={styles.hero}>
            <View style={styles.heroTop}><View><Text style={styles.heroOverline}>TRUST LEVEL</Text><Text style={styles.heroTitle}>{verified ? 'Fully verified' : hasDocument ? 'Review in progress' : 'Build your trust profile'}</Text></View><View style={styles.levelOrb}><Text style={styles.levelNumber}>{approved}</Text><Text style={styles.levelOf}>of 5</Text></View></View>
            <ProgressBar progress={progress} label={`Verification ${Math.round(progress * 100)} percent complete`} />
            <Text style={styles.heroCopy}>{verified ? 'Your verified identity and selfie signals are visible to the community.' : 'Each step helps people connect with greater confidence and accountability.'}</Text>
          </LinearGradient>
        </Animated.View>

        <Pressable accessibilityRole="button" accessibilityLabel="Learn why verification matters" accessibilityHint="Opens verification benefits" onPress={() => router.push('/profile/verification/benefits')}><Card><View style={styles.whyRow}><View style={styles.whyIcon}><Text style={styles.whyIconText}>◇</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>Why verify?</Text><Text style={styles.body}>Higher trust, stronger matches and a safer community.</Text></View><Text style={styles.chevron}>›</Text></View></Card></Pressable>

        <View style={styles.sectionHeader}><Text style={styles.overline}>YOUR PROGRESS</Text><Text style={styles.sectionTitle}>Five levels of confidence</Text><Text style={styles.body}>Verification is designed to establish authenticity—not to judge your worth.</Text></View>
        <View style={styles.timeline}>{levels.map((level, index) => {
          const presentation = statusPresentation[level.state];
          return <Card key={level.level} accessibilityLabel={`Level ${level.level}, ${level.title}, ${presentation.label}`}>
            <View style={styles.levelRow}><View style={[styles.stepCircle, level.state === 'approved' && styles.stepApproved]}><Text style={[styles.stepNumber, level.state === 'approved' && styles.stepNumberApproved]}>{level.state === 'approved' ? '✓' : level.level}</Text></View><View style={styles.flex}><Text style={styles.levelTitle}>{level.title}</Text><Text style={styles.body}>{level.description}</Text><View style={styles.status}><Badge label={presentation.label} tone={presentation.tone} /></View></View></View>
            {index === 2 && !hasDocument ? <Button label="Submit identity document" variant="outline" loading={submission.isPending} onPress={() => void chooseDocument()} accessibilityHint="Opens your photo library to choose an identity document image" style={styles.levelButton} /> : null}
            {index === 4 && !verified ? <Button label="Take verification selfie" variant="premiumGold" loading={submission.isPending} onPress={() => void captureSelfie()} accessibilityHint="Opens the front camera for a secure verification selfie" style={styles.levelButton} /> : null}
          </Card>;
        })}</View>
        <Card accessibilityLabel="Verification privacy information"><Text style={styles.cardTitle}>Handled with care</Text><Text style={styles.body}>Verification submissions are used only to confirm authenticity and support community safety. Your document is never displayed on your profile.</Text></Card>
      </ScrollView>
    </SafeAreaView>
  </Screen>;
}

function Screen({ children }: { children: React.ReactNode }) { return <View style={styles.container}><LinearGradient colors={theme.gradients.lynkDarkLuxuryGradient} style={StyleSheet.absoluteFill} />{children}</View>; }
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background }, safeArea: { flex: 1 }, flex: { flex: 1 }, header: { minHeight: theme.spacing[64], paddingHorizontal: theme.spacing[16], flexDirection: 'row', alignItems: 'center' }, headerAction: { width: theme.spacing[48], minHeight: theme.spacing[48], justifyContent: 'center' }, headerCenter: { flex: 1, alignItems: 'center' }, back: { ...theme.typography.headingL, color: theme.colors.textPrimary }, overline: { ...theme.typography.caption, color: theme.colors.lightGold }, headerTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary }, content: { padding: theme.spacing[16], paddingBottom: theme.spacing[48], gap: theme.spacing[16] }, hero: { borderRadius: theme.radius.xxl, padding: theme.spacing[24], gap: theme.spacing[16], ...theme.shadows.premium }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing[16] }, heroOverline: { ...theme.typography.caption, color: theme.colors.white }, heroTitle: { ...theme.typography.headingL, color: theme.colors.white, marginTop: theme.spacing[4], flexShrink: 1 }, levelOrb: { width: theme.spacing[64], height: theme.spacing[64], borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.lightGold }, levelNumber: { ...theme.typography.headingM, color: theme.colors.lightGold }, levelOf: { ...theme.typography.caption, color: theme.colors.white }, heroCopy: { ...theme.typography.bodySmall, color: theme.colors.white }, whyRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }, whyIcon: { width: theme.spacing[48], height: theme.spacing[48], borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }, whyIconText: { ...theme.typography.headingM, color: theme.colors.lightGold }, cardTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, body: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, chevron: { ...theme.typography.headingL, color: theme.colors.textTertiary }, sectionHeader: { marginTop: theme.spacing[8] }, sectionTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary, marginTop: theme.spacing[4] }, timeline: { gap: theme.spacing[12] }, levelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[12] }, stepCircle: { width: theme.spacing[40], height: theme.spacing[40], borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }, stepApproved: { backgroundColor: theme.colors.success, borderColor: theme.colors.success }, stepNumber: { ...theme.typography.label, color: theme.colors.textSecondary }, stepNumberApproved: { color: theme.colors.white }, levelTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, status: { marginTop: theme.spacing[8] }, levelButton: { marginTop: theme.spacing[16] },
});

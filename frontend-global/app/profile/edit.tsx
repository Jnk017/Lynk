import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, ErrorState, LoadingState, TextField } from '../../src/components/premium';
import { theme } from '../../src/design-system';
import { getDetailValues } from '../../src/features/profile/completion';
import { ProfileDetailCategory, ProfileDetailTag } from '../../src/features/profile/types';
import { profileQueryKey, useProfile } from '../../src/features/profile/useProfile';
import { API_ENDPOINTS } from '../../src/constants/api';
import { api } from '../../src/services/api';
import { getErrorMessage } from '../../src/utils/errors';

const DETAIL_FIELDS: Array<{ category: ProfileDetailCategory; label: string; placeholder: string }> = [
  { category: 'interests', label: 'Interests', placeholder: 'Travel, live music, cooking' },
  { category: 'values', label: 'Values', placeholder: 'Faith, family, kindness' },
  { category: 'relationshipGoals', label: 'Relationship goals', placeholder: 'Marriage, committed partnership' },
  { category: 'lifestyle', label: 'Lifestyle', placeholder: 'Active, non-smoker, early riser' },
  { category: 'languages', label: 'Languages', placeholder: 'English, Spanish' },
  { category: 'education', label: 'Education', placeholder: 'University or field of study' },
  { category: 'occupation', label: 'Occupation', placeholder: 'Your role or calling' },
];

export default function EditProfileScreen() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [details, setDetails] = useState<Record<ProfileDetailCategory, string>>({ interests: '', relationshipGoals: '', values: '', lifestyle: '', languages: '', education: '', occupation: '' });

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio ?? ''); setCity(profile.location?.city ?? ''); setCountry(profile.location?.country ?? '');
    setDetails((current) => DETAIL_FIELDS.reduce((next, field) => ({ ...next, [field.category]: getDetailValues(profile, field.category).join(', ') }), current));
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile) return;
      const managed = new Set<ProfileDetailCategory>(DETAIL_FIELDS.map((field) => field.category));
      const preserved = (profile.lifestyleTags ?? []).filter((tag) => !managed.has(tag.category as ProfileDetailCategory));
      const lifestyleTags: ProfileDetailTag[] = [...preserved, ...DETAIL_FIELDS.flatMap((field) => details[field.category].split(',').map((value) => value.trim()).filter(Boolean).map((label) => ({ category: field.category, label })))];
      return api.patch(API_ENDPOINTS.users.updateMe, { bio: bio.trim(), location: { ...profile.location, city: city.trim(), country: country.trim() }, lifestyleTags });
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: profileQueryKey }); Alert.alert('Profile updated', 'Your profile strength and recommendations are now refreshed.', [{ text: 'Done', onPress: () => router.back() }]); },
    onError: (error) => Alert.alert('Could not update profile', getErrorMessage(error)),
  });
  const photoMutation = useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => { const body = new FormData(); body.append('photo', { uri: asset.uri, name: asset.fileName ?? 'profile-photo.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob); return api.post(API_ENDPOINTS.profile.uploadPhoto, body, { headers: { 'Content-Type': 'multipart/form-data' } }); },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: profileQueryKey }); Alert.alert('Photo added', 'Your profile strength has been refreshed.'); },
    onError: (error) => Alert.alert('Could not add photo', getErrorMessage(error)),
  });
  const addPhoto = async () => { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('Photo access needed', 'Allow photo access in Settings to add a profile photo.'); const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9 }); if (!result.canceled) photoMutation.mutate(result.assets[0]); };

  if (isLoading) return <Screen><LoadingState label="Opening your profile editor" /></Screen>;
  if (isError || !profile) return <Screen><ErrorState title="We could not open the editor" description="Please try again. No changes were lost." onRetry={() => void refetch()} /></Screen>;
  return <Screen><SafeAreaView style={styles.safeArea}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Cancel editing" accessibilityHint="Returns to profile without saving new text changes" onPress={() => router.back()} style={styles.headerAction}><Text style={styles.cancel}>Cancel</Text></Pressable><Text style={styles.headerTitle}>Edit profile</Text><Pressable accessibilityRole="button" accessibilityLabel="Save profile" accessibilityHint="Saves all profile details" onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={styles.headerAction}><Text style={styles.save}>{saveMutation.isPending ? 'Saving' : 'Save'}</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View><Text style={styles.eyebrow}>PROFILE BUILDER</Text><Text style={styles.title}>Show who you are—with intention.</Text><Text style={styles.subtitle}>Every detail is optional. Choose what helps compatible people understand you.</Text></View>
      <Card><View style={styles.photoRow}><View style={styles.photoMark}><Text style={styles.photoMarkText}>◉</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>Profile photos</Text><Text style={styles.helper}>{profile.media?.filter((item) => item.type === 'photo').length ?? 0} added · worth 15% completion</Text></View></View><Button label="Add a photo" variant="outline" loading={photoMutation.isPending} onPress={() => void addPhoto()} accessibilityHint="Opens your photo library" style={styles.photoButton} /></Card>
      <Card><Text style={styles.cardTitle}>About you</Text><View style={styles.fields}><TextField label="About me" value={bio} onChangeText={setBio} placeholder="Share what matters to you and what a meaningful relationship looks like." multiline maxLength={500} style={styles.bioField} /><View style={styles.twoColumns}><View style={styles.flex}><TextField label="City" value={city} onChangeText={setCity} placeholder="City" /></View><View style={styles.flex}><TextField label="Country" value={country} onChangeText={setCountry} placeholder="Country" /></View></View></View></Card>
      <Card><Text style={styles.cardTitle}>Compatibility details</Text><Text style={styles.helper}>Separate multiple answers with commas. Keep them honest and specific.</Text><View style={styles.fields}>{DETAIL_FIELDS.map((field) => <TextField key={field.category} label={field.label} value={details[field.category]} onChangeText={(value) => setDetails((current) => ({ ...current, [field.category]: value }))} placeholder={field.placeholder} />)}</View></Card>
      <Button label="Save profile" variant="premiumGold" loading={saveMutation.isPending} onPress={() => saveMutation.mutate()} accessibilityHint="Saves profile details and refreshes profile strength" />
    </ScrollView>
  </SafeAreaView></Screen>;
}
function Screen({ children }: { children: React.ReactNode }) { return <View style={styles.container}><LinearGradient colors={theme.gradients.lynkDarkLuxuryGradient} style={StyleSheet.absoluteFill} />{children}</View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, safeArea: { flex: 1 }, flex: { flex: 1 }, header: { minHeight: theme.spacing[64], paddingHorizontal: theme.spacing[16], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerAction: { width: theme.spacing[64], minHeight: theme.spacing[48], justifyContent: 'center' }, cancel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary }, save: { ...theme.typography.label, color: theme.colors.lightGold, textAlign: 'right' }, headerTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary }, content: { padding: theme.spacing[16], paddingBottom: theme.spacing[48], gap: theme.spacing[16] }, eyebrow: { ...theme.typography.caption, color: theme.colors.lightGold }, title: { ...theme.typography.headingL, color: theme.colors.textPrimary, marginTop: theme.spacing[4] }, subtitle: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[8] }, cardTitle: { ...theme.typography.bodyLarge, fontWeight: '700', color: theme.colors.textPrimary }, helper: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, fields: { gap: theme.spacing[16], marginTop: theme.spacing[16] }, bioField: { minHeight: theme.spacing[64] * 2, paddingTop: theme.spacing[16], textAlignVertical: 'top' }, twoColumns: { flexDirection: 'row', gap: theme.spacing[12] }, photoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }, photoMark: { width: theme.spacing[48], height: theme.spacing[48], borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }, photoMarkText: { ...theme.typography.headingM, color: theme.colors.lightGold }, photoButton: { marginTop: theme.spacing[16] } });

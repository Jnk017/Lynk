import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Entrance, ErrorState, LoadingState } from '../../src/components/premium';
import { theme } from '../../src/design-system';
import { calculateProfileCompletion, getDetailValues } from '../../src/features/profile/completion';
import { CompletionCard, InsightsCard, ProfileSectionCard, TrustBadgeRow, VerificationSummary } from '../../src/features/profile/ProfileExperience';
import { useProfile } from '../../src/features/profile/useProfile';
import { getVerificationLevels } from '../../src/features/profile/verification';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  if (isLoading) return <ScreenShell><LoadingState label="Preparing your profile" /></ScreenShell>;
  if (isError || !profile) return <ScreenShell><ErrorState title="We could not load your profile" description="Your information is safe. Please try again." onRetry={() => void refetch()} /></ScreenShell>;

  const completion = calculateProfileCompletion(profile);
  const levels = getVerificationLevels(profile);
  const verificationProgress = levels.filter((level) => level.state === 'approved').length * 20;
  const trustScore = Math.round(Number(profile.trustScore ?? 0));
  const seriousnessScore = Math.round(completion.percentage * 0.6 + trustScore * 0.4);
  const photo = profile.media?.find((item) => item.type === 'photo')?.url;
  const details = (category: Parameters<typeof getDetailValues>[1]) => getDetailValues(profile, category).join(' · ');
  const edit = () => router.push('/profile/edit');

  return (
    <ScreenShell>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to the previous screen" onPress={() => router.back()} style={styles.headerAction}><Text style={styles.headerIcon}>‹</Text></Pressable>
          <View style={styles.headerTitleWrap}><Text style={styles.headerEyebrow}>YOUR LYNK IDENTITY</Text><Text style={styles.headerTitle}>Profile</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" accessibilityHint="Opens the profile editor" onPress={edit} style={styles.headerAction}><Text style={styles.editText}>Edit</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Entrance>
            <View style={styles.identity}>
              {photo ? <Image source={{ uri: photo }} style={styles.avatarImage} accessibilityLabel={`${profile.displayName ?? 'Your'} profile photo`} /> : <Avatar label={profile.displayName ?? 'Lynk member'} size={96} />}
              <Text style={styles.displayName}>{profile.displayName ?? 'Complete your name'}</Text>
              {profile.location?.city || profile.location?.country ? <Text style={styles.location}>{[profile.location.city, profile.location.country].filter(Boolean).join(', ')}</Text> : <Text style={styles.location}>Add a location to meet people nearby</Text>}
              <TrustBadgeRow profile={profile} completion={completion} />
            </View>
          </Entrance>

          <View style={styles.scoreRow} accessibilityLabel={`Relationship seriousness score ${seriousnessScore}. Trust score ${trustScore}.`}>
            <View style={styles.scoreItem}><Text style={styles.scoreValue}>{seriousnessScore}</Text><Text style={styles.scoreLabel}>Seriousness</Text></View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}><Text style={styles.scoreValue}>{trustScore}</Text><Text style={styles.scoreLabel}>Trust</Text></View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}><Text style={styles.scoreValue}>{completion.percentage}%</Text><Text style={styles.scoreLabel}>Complete</Text></View>
          </View>

          <CompletionCard completion={completion} onAction={edit} />
          <VerificationSummary progress={verificationProgress} status={verificationProgress === 100 ? 'Verified' : profile.kycDocumentUrl ? 'Review in progress' : 'Build your trust level'} onPress={() => router.push('/profile/verification')} />
          <InsightsCard completion={completion} verified={profile.verificationStatus === 'verified'} />

          <View style={styles.sectionHeader}><Text style={styles.sectionEyebrow}>YOUR STORY</Text><Text style={styles.sectionHeading}>Profile details</Text></View>
          <View style={styles.sectionGrid}>
            <ProfileSectionCard title="Photos" value={profile.media?.filter((item) => item.type === 'photo').length ? `${profile.media.filter((item) => item.type === 'photo').length} photo${profile.media.filter((item) => item.type === 'photo').length === 1 ? '' : 's'}` : undefined} emptyText="Let people see the person behind your story." icon="◉" actionLabel="Add a photo" onPress={edit} />
            <ProfileSectionCard title="About me" value={profile.bio} emptyText="A warm introduction helps meaningful people connect." icon="✦" onPress={edit} />
            <ProfileSectionCard title="Interests" value={details('interests')} emptyText="Shared interests make first conversations easier." icon="♡" onPress={edit} />
            <ProfileSectionCard title="Values" value={details('values')} emptyText="Share what grounds your decisions and relationships." icon="◇" onPress={edit} />
            <ProfileSectionCard title="Relationship goals" value={details('relationshipGoals')} emptyText="Clarity creates better, more intentional matches." icon="∞" onPress={edit} />
            <ProfileSectionCard title="Lifestyle" value={details('lifestyle')} emptyText="Offer a glimpse into your everyday rhythm." icon="☼" onPress={edit} />
            <ProfileSectionCard title="Languages" value={details('languages')} emptyText="Show how you connect across cultures." icon="◎" onPress={edit} />
            <ProfileSectionCard title="Education" value={details('education')} emptyText="Add the learning experiences that shaped you." icon="△" onPress={edit} />
            <ProfileSectionCard title="Occupation" value={details('occupation')} emptyText="Share the work or purpose that energizes you." icon="□" onPress={edit} />
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionEyebrow}>ACCOUNT</Text><Text style={styles.sectionHeading}>Community & preferences</Text></View>
          <View style={styles.sectionGrid}>
            <ProfileSectionCard title="Verification" value={profile.verificationStatus === 'verified' ? 'Identity and selfie verified' : profile.kycDocumentUrl ? 'Identity review pending' : undefined} emptyText="Strengthen trust across the Lynk community." icon="✓" onPress={() => router.push('/profile/verification')} />
            <ProfileSectionCard title="Referral" value={profile.isFounder && profile.founderRank ? `Founder #${profile.founderRank}` : 'Invite people who share your intentions'} emptyText="Grow a thoughtful relationship community." icon="⌁" onPress={() => router.push('/referral')} />
            <ProfileSectionCard title="Settings" value="Privacy, discovery and account preferences" emptyText="Manage your experience." icon="⚙" onPress={() => router.push('/profile/settings')} />
          </View>
          <Button label="Sign out" variant="ghost" onPress={() => void logout()} accessibilityHint="Signs you out of Lynk on this device" />
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}><LinearGradient colors={theme.gradients.lynkDarkLuxuryGradient} style={StyleSheet.absoluteFill} /><View style={styles.glowTop} /><View style={styles.glowBottom} />{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background }, safeArea: { flex: 1 }, glowTop: { position: 'absolute', top: -theme.spacing[64], right: -theme.spacing[48], width: theme.spacing[64] * 3, height: theme.spacing[64] * 3, borderRadius: theme.radius.full, backgroundColor: theme.colors.secondaryPurple, opacity: 0.18 }, glowBottom: { position: 'absolute', bottom: theme.spacing[64], left: -theme.spacing[64], width: theme.spacing[64] * 2, height: theme.spacing[64] * 2, borderRadius: theme.radius.full, backgroundColor: theme.colors.deepGold, opacity: 0.08 }, header: { minHeight: theme.spacing[64], paddingHorizontal: theme.spacing[16], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerAction: { minWidth: theme.spacing[48], minHeight: theme.spacing[48], justifyContent: 'center' }, headerIcon: { ...theme.typography.headingL, color: theme.colors.textPrimary }, editText: { ...theme.typography.label, color: theme.colors.lightGold, textAlign: 'right' }, headerTitleWrap: { alignItems: 'center' }, headerEyebrow: { ...theme.typography.caption, color: theme.colors.textTertiary }, headerTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary }, content: { paddingHorizontal: theme.spacing[16], paddingBottom: theme.spacing[48], gap: theme.spacing[16] }, identity: { alignItems: 'center', gap: theme.spacing[8], paddingVertical: theme.spacing[16] }, avatarImage: { width: 96, height: 96, borderRadius: theme.radius.full, borderWidth: 2, borderColor: theme.colors.lightGold }, displayName: { ...theme.typography.headingL, color: theme.colors.textPrimary, textAlign: 'center' }, location: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center' }, scoreRow: { flexDirection: 'row', paddingVertical: theme.spacing[16], borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.borderSubtle }, scoreItem: { flex: 1, alignItems: 'center' }, scoreValue: { ...theme.typography.headingM, color: theme.colors.lightGold }, scoreLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing[4] }, scoreDivider: { width: 1, backgroundColor: theme.colors.borderSubtle }, sectionHeader: { marginTop: theme.spacing[16] }, sectionEyebrow: { ...theme.typography.caption, color: theme.colors.lightGold }, sectionHeading: { ...theme.typography.headingM, color: theme.colors.textPrimary, marginTop: theme.spacing[4] }, sectionGrid: { gap: theme.spacing[12] },
});

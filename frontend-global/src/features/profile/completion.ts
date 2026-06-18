import { LynkProfile, ProfileDetailCategory, ProfileSectionDefinition } from './types';

export type ProfileStrength = 'Weak' | 'Fair' | 'Good' | 'Excellent';

export interface ProfileCompletionResult {
  percentage: number;
  strength: ProfileStrength;
  sections: ProfileSectionDefinition[];
  completed: ProfileSectionDefinition[];
  missing: ProfileSectionDefinition[];
}

export function getDetailValues(profile: LynkProfile, category: ProfileDetailCategory): string[] {
  return (profile.lifestyleTags ?? [])
    .filter((tag) => tag.category === category)
    .map((tag) => tag.label ?? tag.value ?? tag.name)
    .filter((value): value is string => Boolean(value?.trim()));
}

export function calculateProfileCompletion(profile: LynkProfile): ProfileCompletionResult {
  const has = (category: ProfileDetailCategory) => getDetailValues(profile, category).length > 0;
  const sections: ProfileSectionDefinition[] = [
    { key: 'photo', label: 'Profile photo', actionLabel: 'Add a profile photo', weight: 15, complete: Boolean(profile.media?.some((item) => item.type === 'photo')) },
    { key: 'about', label: 'About me', actionLabel: 'Tell people about yourself', weight: 15, complete: Boolean(profile.bio?.trim()) },
    { key: 'interests', label: 'Interests', actionLabel: 'Complete your interests', weight: 10, complete: has('interests') },
    { key: 'location', label: 'Location', actionLabel: 'Add your location', weight: 10, complete: Boolean(profile.location?.city || profile.location?.country) },
    { key: 'relationshipGoals', label: 'Relationship goals', actionLabel: 'Add relationship goals', weight: 10, complete: has('relationshipGoals') },
    { key: 'values', label: 'Values', actionLabel: 'Share the values that guide you', weight: 10, complete: has('values') },
    { key: 'verification', label: 'Verification', actionLabel: 'Verify your identity', weight: 15, complete: profile.verificationStatus === 'verified' },
    { key: 'lifestyle', label: 'Lifestyle details', actionLabel: 'Add lifestyle details', weight: 5, complete: has('lifestyle') },
    { key: 'languages', label: 'Languages', actionLabel: 'Add languages you speak', weight: 5, complete: has('languages') },
    { key: 'educationOccupation', label: 'Education / occupation', actionLabel: 'Add education or occupation', weight: 5, complete: has('education') || has('occupation') },
  ];
  const percentage = sections.reduce((score, section) => score + (section.complete ? section.weight : 0), 0);
  return {
    percentage,
    strength: getProfileStrength(percentage),
    sections,
    completed: sections.filter((section) => section.complete),
    missing: sections.filter((section) => !section.complete),
  };
}

export function getProfileStrength(percentage: number): ProfileStrength {
  if (percentage < 40) return 'Weak';
  if (percentage < 60) return 'Fair';
  if (percentage < 80) return 'Good';
  return 'Excellent';
}

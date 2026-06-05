import { ProfileMedia, SubscriptionPlan } from '../../types/api';

export type ProfileDetailCategory =
  | 'interests'
  | 'relationshipGoals'
  | 'values'
  | 'lifestyle'
  | 'languages'
  | 'education'
  | 'occupation';

export interface ProfileDetailTag {
  category?: ProfileDetailCategory | string;
  label?: string;
  value?: string;
  name?: string;
  [key: string]: unknown;
}

export interface LynkProfile {
  id: string;
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: { lat?: number; lng?: number; city?: string; country?: string };
  lifestyleTags?: ProfileDetailTag[];
  media?: ProfileMedia[];
  verificationStatus?: string;
  livenessVideoUrl?: string;
  kycDocumentUrl?: string;
  trustScore?: number | string;
  isProfileComplete?: boolean;
  isFounder?: boolean;
  founderRank?: number;
  subscriptionPlan?: SubscriptionPlan;
}

export interface ProfileSectionDefinition {
  key: 'photo' | 'about' | 'interests' | 'location' | 'relationshipGoals' | 'values' | 'verification' | 'lifestyle' | 'languages' | 'educationOccupation';
  label: string;
  actionLabel: string;
  weight: number;
  complete: boolean;
}

import type { ProfileCompletionResult } from '../profile/completion';
import type { LynkProfile } from '../profile/types';
import type { MarriageCommitmentStatus } from './types';

export type JourneyState = 'completed' | 'current' | 'upcoming';

export interface JourneyStage {
  key: Exclude<MarriageCommitmentStatus, 'cancelled'>;
  title: string;
  description: string;
  state: JourneyState;
}

const journeyDefinitions: Array<Omit<JourneyStage, 'state'>> = [
  { key: 'matched', title: 'Matched', description: 'A mutual connection began your shared story.' },
  { key: 'relationship_started', title: 'Relationship started', description: 'You chose to explore the relationship intentionally.' },
  { key: 'commitment_created', title: 'Commitment created', description: 'Your shared intention was made visible.' },
  { key: 'active', title: 'Marriage commitment active', description: 'Both partners are participating in the commitment.' },
  { key: 'proof_submitted', title: 'Proof submitted', description: 'Marriage documentation was shared securely.' },
  { key: 'review', title: 'Verification review', description: 'The Lynk team is reviewing the submitted proof.' },
  { key: 'confirmed', title: 'Marriage confirmed', description: 'Your marriage milestone has been verified.' },
  { key: 'released', title: 'Commitment released', description: 'The commitment journey is complete.' },
];

export function buildJourney(status?: MarriageCommitmentStatus): JourneyStage[] {
  const currentIndex = status && status !== 'cancelled' ? journeyDefinitions.findIndex((stage) => stage.key === status) : -1;
  return journeyDefinitions.map((stage, index) => ({
    ...stage,
    state: currentIndex < 0 ? 'upcoming' : index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

export interface CommitmentScore {
  label: 'New Commitment' | 'Growing Commitment' | 'Strong Commitment' | 'Verified Commitment' | 'Marriage Ready';
  percentage: number;
  explanation: string;
}

export function calculateCommitmentScore(profile: LynkProfile, completion: ProfileCompletionResult): CommitmentScore {
  const verified = profile.verificationStatus === 'verified';
  const status = profile.marriageCommitment?.status;
  const relationshipPoints: Partial<Record<MarriageCommitmentStatus, number>> = {
    matched: 8,
    relationship_started: 14,
    commitment_created: 22,
    active: 28,
    proof_submitted: 34,
    review: 37,
    confirmed: 40,
    released: 40,
  };
  const percentage = Math.min(100, Math.round(completion.percentage * 0.4 + (verified ? 20 : 0) + (relationshipPoints[status ?? 'cancelled'] ?? 0)));
  if (status === 'confirmed' || status === 'released') return { label: 'Marriage Ready', percentage, explanation: 'Your verified relationship journey reflects a shared long-term commitment.' };
  if (verified && ['proof_submitted', 'review'].includes(status ?? '')) return { label: 'Verified Commitment', percentage, explanation: 'Your identity and shared commitment progress have both reached trusted stages.' };
  if (percentage >= 70) return { label: 'Strong Commitment', percentage, explanation: 'Your profile, verification and relationship progress show clear intention.' };
  if (percentage >= 40) return { label: 'Growing Commitment', percentage, explanation: 'You are building a clearer, more trusted relationship foundation.' };
  return { label: 'New Commitment', percentage, explanation: 'Complete your profile and verification as you prepare for an intentional relationship.' };
}

export function getSharedProgress(profile: LynkProfile, completionPercentage: number): number {
  const partnerCompletion = profile.marriageCommitment?.partner?.profileCompletion;
  if (partnerCompletion === undefined) return 0;
  return Math.round((completionPercentage + partnerCompletion) / 2);
}

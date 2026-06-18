import { LynkProfile } from './types';

export type VerificationState = 'approved' | 'pending' | 'needsAction';
export interface VerificationLevel { level: number; title: string; description: string; state: VerificationState }

export function getVerificationLevels(profile: LynkProfile): VerificationLevel[] {
  const verified = profile.verificationStatus === 'verified';
  const identitySubmitted = Boolean(profile.kycDocumentUrl);
  const selfieSubmitted = Boolean(profile.livenessVideoUrl);
  return [
    { level: 1, title: 'Phone verified', description: 'Confirms a reachable phone number.', state: profile.phone ? 'approved' : 'needsAction' },
    { level: 2, title: 'Email verified', description: 'Confirms a reliable account contact.', state: profile.email ? 'approved' : 'needsAction' },
    { level: 3, title: 'Identity document submitted', description: 'A secure document is ready for review.', state: identitySubmitted ? (verified ? 'approved' : 'pending') : 'needsAction' },
    { level: 4, title: 'Identity approved', description: 'Your identity review has been completed.', state: verified ? 'approved' : identitySubmitted ? 'pending' : 'needsAction' },
    { level: 5, title: 'Selfie verified', description: 'A live selfie confirms you match your profile.', state: verified ? 'approved' : selfieSubmitted ? 'pending' : 'needsAction' },
  ];
}

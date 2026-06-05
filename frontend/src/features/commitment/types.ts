export type MarriageCommitmentStatus =
  | 'matched'
  | 'relationship_started'
  | 'commitment_created'
  | 'active'
  | 'proof_submitted'
  | 'review'
  | 'confirmed'
  | 'released'
  | 'cancelled';

export type CommitmentHistoryStatus = 'created' | 'active' | 'proof_submitted' | 'released' | 'cancelled';

export interface CommitmentPartner {
  id: string;
  displayName?: string;
  verificationStatus?: string;
  profileCompletion?: number;
  commitmentStatus?: MarriageCommitmentStatus;
}

export interface CommitmentHistoryEntry {
  id: string;
  status: CommitmentHistoryStatus;
  createdAt: string;
  title?: string;
}

export interface MarriageCommitmentSnapshot {
  id: string;
  status: MarriageCommitmentStatus;
  createdAt?: string;
  updatedAt?: string;
  partner?: CommitmentPartner;
  history?: CommitmentHistoryEntry[];
}

export type DateCommitmentStatus = 'active' | 'confirmed' | 'completed' | 'cancelled';

export interface DateCommitmentSnapshot {
  id: string;
  status: DateCommitmentStatus;
  partnerName?: string;
  dateScheduledAt?: string;
  dateLocation?: string;
  creatorConfirmed?: boolean;
  partnerConfirmed?: boolean;
  createdAt?: string;
}

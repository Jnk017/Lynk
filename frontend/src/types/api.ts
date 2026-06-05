export type SubscriptionTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type MediaType = 'photo' | 'video';

export interface SubscriptionPlan {
  name: SubscriptionTier;
  displayName: string;
  tierColor: string;
}

export interface ProfileMedia {
  id: string;
  type: MediaType;
  url: string;
  orderIndex?: number;
}

export interface PublicProfile {
  id: string;
  displayName?: string;
  birthdate?: string;
  bio?: string;
  location?: { city?: string; country?: string; lat?: number; lng?: number };
  verificationStatus?: string;
  isFounder?: boolean;
  founderRank?: number;
  subscriptionPlan?: SubscriptionPlan;
  media?: ProfileMedia[];
}

export interface ChatUser {
  id: string;
  displayName?: string;
  isOnline?: boolean;
  media?: ProfileMedia[];
}

export interface ChatParticipant {
  id: string;
  userId: string;
  user?: ChatUser;
}

export interface ChatRoom {
  id: string;
  participants?: ChatParticipant[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content?: string;
  createdAt: string;
}

export interface ReferralStats {
  referralCode?: string;
  successfulReferralsCount?: number;
  isFounder?: boolean;
  founderRank?: number;
  isRevenueSharingActive?: boolean;
  referredUsers?: number;
  verifiedReferrals?: number;
  totalEarned?: number;
}

export interface RevenuePool {
  id: string;
  period: string;
  totalRevenue: number | string;
  distributableAmount: number | string;
  activeFounderCount: number;
  dividendPerFounder: number | string;
  status: string;
}

export interface RevenueDistribution {
  id: string;
  month: string;
  amount: number | string;
  status: string;
  paidAt?: string;
}


export type ReportReason = 'fake_profile' | 'scam_attempt' | 'harassment' | 'inappropriate_content' | 'impersonation' | 'underage_concern' | 'spam' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export interface CreateReportInput { reportedUserId: string; reason: ReportReason; details?: string; evidenceNote?: string; }
export interface SafetyReport { id: string; reportedUserId: string; reason: ReportReason; status: ReportStatus; resolutionNote?: string | null; createdAt: string; updatedAt: string; }
export interface BlockedMember { id: string; blockedUserId: string; createdAt: string; blockedUser?: Pick<PublicProfile, 'id' | 'displayName' | 'media'>; }

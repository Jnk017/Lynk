export enum VerificationStatus {
  NONE = 'none',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum UserRole {
  USER = 'user',
  PREMIUM_USER = 'premium_user',
  FOUNDER = 'founder',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum SubscriptionTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
}

export enum SwipeAction {
  LIKE = 'like',
  DISLIKE = 'dislike',
  SUPER_LIKE = 'super_like',
}

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  UNMATCHED = 'unmatched',
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  PHOTO = 'photo',
  VIDEO = 'video',
  GIFT = 'gift',
  SYSTEM = 'system',
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  GIFT = 'gift',
  BOOST = 'boost',
  STAKING = 'staking',
  REVENUE_SHARE = 'revenue_share',
  REFUND = 'refund',
}

export enum TransactionCurrency {
  PI = 'pi',
  USD = 'usd',
  EUR = 'eur',
  XOF = 'xof',
}

export enum TransactionProvider {
  PI_NETWORK = 'pi_network',
  STRIPE = 'stripe',
  AVADAPAY = 'avadapay',
  MONEROO = 'moneroo',
  COINBASE_COMMERCE = 'coinbase_commerce',
  INTERNAL = 'internal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ReferralStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  VERIFIED = 'verified',
  REWARDED = 'rewarded',
}

export enum StakingContractStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  RESOLVED_VICTIM = 'resolved_victim',
  RESOLVED_BOTH = 'resolved_both',
}

export enum MarriageStakeStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PROOF_SUBMITTED = 'proof_submitted',
  RELEASED = 'released',
  DISPUTED = 'disputed',
}

export enum MatchmakingSessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  AWAITING_CHOICE = 'awaiting_choice',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum RevenuePoolStatus {
  CALCULATING = 'calculating',
  PROCESSING = 'processing',
  DISTRIBUTING = 'distributing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum RevenueDistributionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ReportReason {
  FAKE_PROFILE = 'fake_profile',
  SCAM_ATTEMPT = 'scam_attempt',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  IMPERSONATION = 'impersonation',
  UNDERAGE_CONCERN = 'underage_concern',
  SPAM = 'spam',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum NotificationType {
  MATCH = 'match',
  MESSAGE = 'message',
  LIKE = 'like',
  SUPER_LIKE = 'super_like',
  GIFT = 'gift',
  BOOST = 'boost',
  REVENUE_SHARE = 'revenue_share',
  MATCHMAKING = 'matchmaking',
  SYSTEM = 'system',
}

export enum BoostType {
  STANDARD = 'standard',
  SUPER = 'super',
  ALGORITHM = 'algorithm',
}

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

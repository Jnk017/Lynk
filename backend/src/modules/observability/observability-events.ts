export enum ObservabilityEventName {
  USER_REGISTERED = 'user_registered',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  PROFILE_VERIFIED = 'profile_verified',
  SWIPE_CREATED = 'swipe_created',
  MATCH_CREATED = 'match_created',
  MESSAGE_SENT = 'message_sent',
  GIFT_SENT = 'gift_sent',
  PAYMENT_CREATED = 'payment_created',
  SUBSCRIPTION_STARTED = 'subscription_started',
  REFERRAL_COMPLETED = 'referral_completed',
  FOUNDER_JOINED = 'founder_joined',
  REPORT_CREATED = 'report_created',
  REPORT_SUBMITTED = 'report_submitted',
  REPORT_RESOLVED = 'report_resolved',
  REPORT_DISMISSED = 'report_dismissed',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',
  SAFETY_CENTER_OPENED = 'safety_center_opened',
  VERIFICATION_REVIEWED = 'verification_reviewed',
}

export type ObservabilityProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

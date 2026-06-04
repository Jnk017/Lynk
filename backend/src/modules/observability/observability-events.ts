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
}

export type ObservabilityProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

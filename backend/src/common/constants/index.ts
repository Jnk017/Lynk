export const MAX_FOUNDERS = 2500;
export const REFERRALS_REQUIRED_FOR_REVENUE_SHARING = 5;
export const REVENUE_SHARING_PERCENTAGE = 0.05; // 5%

export const SUBSCRIPTION_LIMITS = {
  bronze: {
    dailySwipes: 10,
    dailySuperLikes: 0,
    canSeeWhoLiked: false,
    hasSmartMatchmaking: false,
    hasMarriageStaking: false,
  },
  silver: {
    dailySwipes: Infinity,
    dailySuperLikes: 5,
    canSeeWhoLiked: true,
    hasSmartMatchmaking: false,
    hasMarriageStaking: false,
  },
  gold: {
    dailySwipes: Infinity,
    dailySuperLikes: 10,
    canSeeWhoLiked: true,
    hasSmartMatchmaking: false,
    hasMarriageStaking: true,
  },
  platinum: {
    dailySwipes: Infinity,
    dailySuperLikes: 20,
    canSeeWhoLiked: true,
    hasSmartMatchmaking: true,
    hasMarriageStaking: true,
  },
};

export const SUBSCRIPTION_PRICES = {
  bronze: 0,
  silver: 4.99,
  gold: 14.99,
  platinum: 49.99,
};

export const MARRIAGE_STAKE_AMOUNT_USD = 500;

export const JWT_ACCESS_EXPIRY = '24h';
export const JWT_REFRESH_EXPIRY = '30d';

export const REDIS_KEYS = {
  ONLINE_USERS: 'online_users',
  SWIPE_CACHE: (userId: string) => `swipes:${userId}`,
  BOOST_ACTIVE: (userId: string) => `boost:${userId}`,
  DAILY_SWIPES: (userId: string) => `daily_swipes:${userId}`,
};

export const FOUNDER_BADGE_COLOR = '#FFD700';
export const TRUST_SCORE_VERIFICATION_BONUS = 20;
export const TRUST_SCORE_GIFT_BONUS = 2;

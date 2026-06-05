export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    loginPi: '/auth/pi',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logoutAll: '/auth/logout-all',
    changePassword: '/auth/change-password',
    sessions: '/auth/sessions',
    revokeSession: (id: string) => `/auth/sessions/${id}/revoke`,
  },
  users: {
    me: '/users/me',
    updateMe: '/users/me',
    publicProfile: (id: string) => `/users/${id}/profile`,
  },
  profile: {
    uploadPhoto: '/profile/media/photo',
    uploadVideo: '/profile/media/video',
    deleteMedia: (id: string) => `/profile/media/${id}`,
    addPrompt: '/profile/prompts',
    deletePrompt: (id: string) => `/profile/prompts/${id}`,
    suggestedPrompts: '/profile/prompts/suggestions',
    bioSuggestion: '/profile/bio/suggestion',
  },
  matching: {
    swipe: (targetId: string) => `/matchmaking/swipe/${targetId}`,
    discovery: '/matchmaking/discovery',
    aiSession: '/matchmaking/ai-session',
    dropProfile: (sessionId: string, profileId: string) =>
      `/matchmaking/ai-session/${sessionId}/drop/${profileId}`,
    makeChoice: (sessionId: string, profileId: string) =>
      `/matchmaking/ai-session/${sessionId}/choose/${profileId}`,
  },
  chat: {
    rooms: '/chat/rooms',
    createRoom: (matchId: string) => `/chat/rooms/match/${matchId}`,
    messages: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    iceBreakers: (targetId: string) => `/chat/ice-breakers/${targetId}`,
  },
  subscription: {
    plans: '/subscription/plans',
    subscribe: '/subscription/subscribe',
  },
  verification: {
    liveness: '/verification/liveness',
    kyc: '/verification/kyc',
  },
  moderation: {
    reports: '/moderation/reports',
    myReports: '/moderation/reports/me',
  },
  featureFlags: {
    public: '/feature-flags/public',
  },
  admin: {
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    suspend: (id: string) => `/admin/users/${id}/suspend`,
    restore: (id: string) => `/admin/users/${id}/restore`,
    reports: '/admin/reports',
    resolveReport: (id: string) => `/admin/reports/${id}/resolve`,
    pendingVerifications: '/admin/verifications/pending',
    approveVerification: (id: string) => `/admin/verifications/${id}/approve`,
    rejectVerification: (id: string) => `/admin/verifications/${id}/reject`,
  },
  payment: {
    stripeIntent: '/payment/stripe/intent',
    creditPi: '/payment/pi/verify',
    transactions: '/payment/transactions',
  },
  referral: {
    stats: '/referral/stats',
    distributions: '/referral/distributions',
    pools: '/referral/pools',
  },
  staking: {
    contracts: '/staking/contracts',
    create: '/staking',
    confirm: (contractId: string) => `/staking/${contractId}/confirm`,
  },
  marriage: {
    stakes: '/marriage-stake/stakes',
    initiate: '/marriage-stake',
    submitProof: (stakeId: string) => `/marriage-stake/${stakeId}/proof`,
  },
  gifts: {
    catalog: '/gifts/catalog',
    send: '/gifts/send',
  },
};

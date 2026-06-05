export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    loginPi: '/auth/pi',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  users: {
    me: '/users/me',
    updateMe: '/users/me',
    publicProfile: (id: string) => `/users/${id}/profile`,
  },
  verification: {
    kyc: '/verification/kyc',
    liveness: '/verification/liveness',
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
    create: '/staking',
    confirm: (contractId: string) => `/staking/${contractId}/confirm`,
  },
  marriage: {
    initiate: '/marriage-stake',
    submitProof: (stakeId: string) => `/marriage-stake/${stakeId}/proof`,
  },
  safety: {
    reports: '/safety/reports',
    myReports: '/safety/reports/me',
    blocks: '/safety/blocks',
    block: (userId: string) => `/safety/blocks/${userId}`,
  },
  admin: {
    users: '/admin/users',
    reports: '/admin/reports',
    reportReview: (id: string) => `/admin/reports/${id}/review`,
    reportResolve: (id: string) => `/admin/reports/${id}/resolve`,
    verifications: '/admin/verifications',
    verificationReview: (id: string) => `/admin/verifications/${id}/review`,
  },
  gifts: {
    catalog: '/gifts/catalog',
    send: '/gifts/send',
  },
};

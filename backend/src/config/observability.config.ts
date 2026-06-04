export default () => ({
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY || '',
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
});

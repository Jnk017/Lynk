export default () => ({
  pi: {
    apiKey: process.env.PI_API_KEY || '',
    sandboxMode: process.env.PI_SANDBOX === 'true',
    apiBaseUrl: process.env.PI_API_BASE_URL || 'https://api.minepi.com/v2',
  },
});

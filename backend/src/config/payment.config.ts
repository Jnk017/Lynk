export default () => ({
  pi: {
    apiKey: process.env.PI_API_KEY || '',
    sandbox: process.env.PI_SANDBOX === 'true',
    apiBaseUrl: process.env.PI_API_BASE_URL || 'https://api.minepi.com/v2',
  },
  pawapay: {
    apiKey: process.env.PAWAPAY_API_KEY || '',
    baseUrl: process.env.PAWAPAY_BASE_URL || 'https://api.pawapay.com',
  },
  binancePay: {
    apiKey: process.env.BINANCE_PAY_API_KEY || '',
    baseUrl: process.env.BINANCE_PAY_BASE_URL || 'https://api.binance.com',
  },
});

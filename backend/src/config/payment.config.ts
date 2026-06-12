export default () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
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

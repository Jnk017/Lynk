export default () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  avadapay: {
    apiKey: process.env.AVADAPAY_API_KEY || '',
    baseUrl: process.env.AVADAPAY_BASE_URL || 'https://api.avadapay.com',
  },
  moneroo: {
    apiKey: process.env.MONEROO_API_KEY || '',
    baseUrl: process.env.MONEROO_BASE_URL || 'https://api.moneroo.io',
  },
  coinbaseCommerce: {
    apiKey: process.env.COINBASE_COMMERCE_API_KEY || '',
    webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
  },
});

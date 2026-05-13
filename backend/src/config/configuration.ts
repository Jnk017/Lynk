export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'lynk',
    password: process.env.DB_PASSWORD || 'lynk_secret',
    name: process.env.DB_NAME || 'lynk_db',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'lynk_access_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'lynk_refresh_secret_change_me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || 'lynk-media',
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  pi: {
    apiKey: process.env.PI_API_KEY || '',
    sandboxMode: process.env.PI_SANDBOX === 'true',
  },

  avadapay: {
    apiKey: process.env.AVADAPAY_API_KEY || '',
    baseUrl: process.env.AVADAPAY_BASE_URL || 'https://api.avadapay.com',
  },

  moneroo: {
    apiKey: process.env.MONEROO_API_KEY || '',
    baseUrl: process.env.MONEROO_BASE_URL || 'https://api.moneroo.io',
  },
});

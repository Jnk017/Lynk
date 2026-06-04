import aiConfig from './ai.config';
import appConfig from './app.config';
import awsConfig from './aws.config';
import databaseConfig from './database.config';
import observabilityConfig from './observability.config';
import paymentConfig from './payment.config';
import piConfig from './pi.config';
import redisConfig from './redis.config';

export default () => ({
  ...appConfig(),
  ...databaseConfig(),
  ...redisConfig(),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  ...awsConfig(),
  ...aiConfig(),
  ...observabilityConfig(),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },
  ...paymentConfig(),
  ...piConfig(),
});

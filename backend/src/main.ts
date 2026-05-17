import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SubscriptionService } from './modules/subscription/subscription.service';
import { GiftService } from './modules/gift/gift.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Lynk API')
    .setDescription('Lynk – Premium Web3 Dating Application API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & registration')
    .addTag('users', 'User profile management')
    .addTag('profile', 'Media & prompts management')
    .addTag('verification', 'AI liveness & KYC verification')
    .addTag('matchmaking', 'Swipe, discovery & AI Matchmaker')
    .addTag('chat', 'Messaging & real-time chat')
    .addTag('subscription', 'Subscription plans')
    .addTag('payment', 'Payments & transactions')
    .addTag('referral', 'Referral program & Founder revenue sharing')
    .addTag('staking', 'Anti-ghosting date staking')
    .addTag('marriage-stake', 'Marriage Stake Web3 feature')
    .addTag('gifts', 'Virtual gift store')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed default data
  const subscriptionService = app.get(SubscriptionService);
  const giftService = app.get(GiftService);
  await subscriptionService.seedDefaultPlans();
  await giftService.seedGiftCatalog();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Lynk API running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

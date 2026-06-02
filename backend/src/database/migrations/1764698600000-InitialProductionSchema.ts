import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialProductionSchema1764698600000 implements MigrationInterface {
  name = 'InitialProductionSchema1764698600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "verification_status_enum" AS ENUM ('none', 'pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_tier_enum" AS ENUM ('bronze', 'silver', 'gold', 'platinum')`,
    );
    await queryRunner.query(
      `CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'non_binary', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "swipe_action_enum" AS ENUM ('like', 'dislike', 'super_like')`,
    );
    await queryRunner.query(
      `CREATE TYPE "match_status_enum" AS ENUM ('pending', 'matched', 'unmatched')`,
    );
    await queryRunner.query(
      `CREATE TYPE "message_type_enum" AS ENUM ('text', 'audio', 'photo', 'video', 'gift', 'system')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_type_enum" AS ENUM ('subscription', 'gift', 'boost', 'staking', 'revenue_share', 'refund')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_currency_enum" AS ENUM ('pi', 'usd', 'eur', 'xof')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_provider_enum" AS ENUM ('pi_network', 'stripe', 'avadapay', 'moneroo', 'coinbase_commerce', 'internal')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'completed', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TYPE "referral_status_enum" AS ENUM ('pending', 'registered', 'verified', 'rewarded')`,
    );
    await queryRunner.query(
      `CREATE TYPE "revenue_pool_status_enum" AS ENUM ('calculating', 'distributing', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "revenue_distribution_status_enum" AS ENUM ('pending', 'paid', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "staking_contract_status_enum" AS ENUM ('active', 'completed', 'cancelled', 'disputed', 'resolved_victim', 'resolved_both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "marriage_stake_status_enum" AS ENUM ('pending', 'active', 'proof_submitted', 'released', 'disputed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "matchmaking_session_status_enum" AS ENUM ('pending', 'in_progress', 'awaiting_choice', 'completed', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "media_type_enum" AS ENUM ('photo', 'video')`,
    );

    await queryRunner.query(`
      CREATE TABLE "subscription_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" "subscription_tier_enum" NOT NULL UNIQUE,
        "displayName" varchar NOT NULL,
        "priceMonthly" numeric(10,2) NOT NULL DEFAULT 0,
        "pricePi" numeric(10,4) NOT NULL DEFAULT 0,
        "features" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "tierColor" varchar NOT NULL,
        "hasSmartMatchmaking" boolean NOT NULL DEFAULT false,
        "hasMarriageStaking" boolean NOT NULL DEFAULT false,
        "dailySuperLikes" integer NOT NULL DEFAULT 0,
        "dailySwipeLimit" integer,
        "canSeeWhoLiked" boolean NOT NULL DEFAULT false,
        "noAds" boolean NOT NULL DEFAULT false,
        "priorityLikes" boolean NOT NULL DEFAULT false,
        "hasConciergerie" boolean NOT NULL DEFAULT false,
        "exclusivePerks" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "phone" varchar UNIQUE,
        "email" varchar UNIQUE,
        "passwordHash" varchar,
        "piWalletAddress" varchar UNIQUE,
        "googleId" varchar,
        "appleId" varchar,
        "referralCode" varchar NOT NULL UNIQUE,
        "referredById" uuid,
        "successfulReferralsCount" integer NOT NULL DEFAULT 0,
        "isFounder" boolean NOT NULL DEFAULT false,
        "founderRank" integer UNIQUE,
        "isRevenueSharingActive" boolean NOT NULL DEFAULT false,
        "revenueSharingJoinedAt" timestamptz,
        "displayName" varchar,
        "bio" varchar(500),
        "birthdate" timestamptz,
        "gender" "gender_enum",
        "lifestyleTags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "location" jsonb,
        "verificationStatus" "verification_status_enum" NOT NULL DEFAULT 'none',
        "livenessVideoUrl" varchar,
        "kycDocumentUrl" varchar,
        "trustScore" numeric(5,2) NOT NULL DEFAULT 0,
        "subscriptionPlanId" uuid,
        "subscriptionExpiresAt" timestamptz,
        "piBalance" numeric(18,8) NOT NULL DEFAULT 0,
        "fiatBalance" numeric(18,2) NOT NULL DEFAULT 0,
        "isOnline" boolean NOT NULL DEFAULT false,
        "lastSeen" timestamptz,
        "isProfileComplete" boolean NOT NULL DEFAULT false,
        "spotifyConnected" varchar,
        "instagramConnected" varchar,
        "blockContacts" boolean NOT NULL DEFAULT false,
        "isBanned" boolean NOT NULL DEFAULT false,
        "bannedAt" timestamptz,
        "banReason" varchar,
        "fcmToken" varchar,
        "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_users_referredById" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_users_subscriptionPlanId" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_phone" ON "users" ("phone")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_piWalletAddress" ON "users" ("piWalletAddress")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_referralCode" ON "users" ("referralCode")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_isFounder" ON "users" ("isFounder")`,
    );

    await queryRunner.query(`
      CREATE TABLE "profile_media" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "media_type_enum" NOT NULL,
        "url" varchar NOT NULL,
        "thumbnailUrl" varchar,
        "orderIndex" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "isModerated" boolean NOT NULL DEFAULT false,
        "isFlagged" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_profile_media_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_prompts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "question" varchar NOT NULL,
        "textAnswer" varchar(300),
        "audioUrl" varchar,
        "orderIndex" integer NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_user_prompts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "swipe_actions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "swiperId" uuid NOT NULL,
        "swipedId" uuid NOT NULL,
        "action" "swipe_action_enum" NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "UQ_swipe_actions_pair" UNIQUE ("swiperId", "swipedId"),
        CONSTRAINT "FK_swipe_actions_swiperId" FOREIGN KEY ("swiperId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_swipe_actions_swipedId" FOREIGN KEY ("swipedId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_swipe_actions_swiperId" ON "swipe_actions" ("swiperId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_swipe_actions_swipedId" ON "swipe_actions" ("swipedId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "initiatorId" uuid NOT NULL,
        "receiverId" uuid NOT NULL,
        "status" "match_status_enum" NOT NULL DEFAULT 'matched',
        "bumbleMode" boolean NOT NULL DEFAULT false,
        "firstMessageSent" boolean NOT NULL DEFAULT false,
        "unmatchedAt" timestamptz,
        "unmatchedById" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_matches_initiatorId" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_matches_receiverId" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_matches_initiatorId" ON "matches" ("initiatorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_matches_receiverId" ON "matches" ("receiverId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "matchmaking_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "status" "matchmaking_session_status_enum" NOT NULL DEFAULT 'pending',
        "profile1Id" uuid,
        "profile2Id" uuid,
        "profile3Id" uuid,
        "droppedProfileId" uuid,
        "finalChoiceId" uuid,
        "quarterPeriod" varchar,
        "startedAt" timestamptz NOT NULL DEFAULT now(),
        "completedAt" timestamptz,
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_matchmaking_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_matchmaking_sessions_profile1Id" FOREIGN KEY ("profile1Id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_matchmaking_sessions_profile2Id" FOREIGN KEY ("profile2Id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_matchmaking_sessions_profile3Id" FOREIGN KEY ("profile3Id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_matchmaking_sessions_droppedProfileId" FOREIGN KEY ("droppedProfileId") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_matchmaking_sessions_finalChoiceId" FOREIGN KEY ("finalChoiceId") REFERENCES "users"("id") ON DELETE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_rooms" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "matchId" uuid,
        "isEncrypted" boolean NOT NULL DEFAULT false,
        "lastMessageAt" timestamptz,
        "lastMessagePreview" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_participants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "chatRoomId" uuid NOT NULL,
        "lastReadAt" timestamptz,
        "isMuted" boolean NOT NULL DEFAULT false,
        "joinedAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_chat_participants_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_chat_participants_chatRoomId" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "chatRoomId" uuid NOT NULL,
        "senderId" uuid NOT NULL,
        "type" "message_type_enum" NOT NULL DEFAULT 'text',
        "content" varchar(2000),
        "mediaUrl" varchar,
        "isEphemeral" boolean NOT NULL DEFAULT false,
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" timestamptz,
        "encryptedPayload" text,
        "isFlagged" boolean NOT NULL DEFAULT false,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_messages_chatRoomId" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_senderId" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "currency" "transaction_currency_enum" NOT NULL,
        "amount" numeric(18,8) NOT NULL,
        "provider" "transaction_provider_enum" NOT NULL,
        "status" "transaction_status_enum" NOT NULL DEFAULT 'pending',
        "externalRef" varchar UNIQUE,
        "metadata" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_transactions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_transactions_provider" ON "transactions" ("provider")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transactions_externalRef" ON "transactions" ("externalRef")`,
    );

    await queryRunner.query(`
      CREATE TABLE "gift_catalog" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "emoji" varchar NOT NULL,
        "animationUrl" varchar,
        "pricePi" numeric(10,4) NOT NULL,
        "priceUsd" numeric(10,2) NOT NULL,
        "isFullScreen" boolean NOT NULL DEFAULT false,
        "trustScoreBonus" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "gifts_sent" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "senderId" uuid NOT NULL,
        "receiverId" uuid NOT NULL,
        "giftCatalogId" uuid NOT NULL,
        "paidCurrency" "transaction_currency_enum" NOT NULL,
        "paidAmount" numeric(18,8) NOT NULL,
        "message" varchar,
        "sentAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_gifts_sent_senderId" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gifts_sent_receiverId" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gifts_sent_giftCatalogId" FOREIGN KEY ("giftCatalogId") REFERENCES "gift_catalog"("id") ON DELETE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "staking_contracts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "creatorId" uuid NOT NULL,
        "partnerId" uuid NOT NULL,
        "stakeAmountPiEach" numeric(18,8) NOT NULL,
        "status" "staking_contract_status_enum" NOT NULL DEFAULT 'active',
        "dateScheduledAt" timestamptz,
        "dateLocation" varchar,
        "creatorConfirmed" boolean NOT NULL DEFAULT false,
        "partnerConfirmed" boolean NOT NULL DEFAULT false,
        "creatorConfirmedAt" timestamptz,
        "partnerConfirmedAt" timestamptz,
        "resolvedAt" timestamptz,
        "victimId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_staking_contracts_creatorId" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staking_contracts_partnerId" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "marriage_stakes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user1Id" uuid NOT NULL,
        "user2Id" uuid NOT NULL,
        "amountPi" numeric(18,8) NOT NULL,
        "status" "marriage_stake_status_enum" NOT NULL DEFAULT 'pending',
        "marriageProofUrl" varchar,
        "marriagePhotoUrl" varchar,
        "verificationCode" varchar,
        "verifiedAt" timestamptz,
        "releasedAt" timestamptz,
        "loyaltyBonusPi" numeric(18,8) NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_marriage_stakes_user1Id" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_marriage_stakes_user2Id" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "referral_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "referrerId" uuid NOT NULL,
        "refereeId" uuid NOT NULL,
        "status" "referral_status_enum" NOT NULL DEFAULT 'pending',
        "verificationPassed" boolean NOT NULL DEFAULT false,
        "rewardAmountPi" numeric(18,8) NOT NULL DEFAULT 0,
        "countsForRevenueSharing" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_referral_logs_referrerId" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_referral_logs_refereeId" FOREIGN KEY ("refereeId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_referral_logs_referrerId" ON "referral_logs" ("referrerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_referral_logs_refereeId" ON "referral_logs" ("refereeId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "revenue_pools" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "period" varchar NOT NULL UNIQUE,
        "totalRevenue" numeric(18,2) NOT NULL DEFAULT 0,
        "distributableAmount" numeric(18,2) NOT NULL DEFAULT 0,
        "activeFounderCount" integer NOT NULL DEFAULT 0,
        "dividendPerFounder" numeric(18,8) NOT NULL DEFAULT 0,
        "status" "revenue_pool_status_enum" NOT NULL DEFAULT 'calculating',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "revenue_distributions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "poolId" uuid NOT NULL,
        "founderId" uuid NOT NULL,
        "month" varchar NOT NULL,
        "amount" numeric(18,8) NOT NULL,
        "status" "revenue_distribution_status_enum" NOT NULL DEFAULT 'pending',
        "paidAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_revenue_distributions_poolId" FOREIGN KEY ("poolId") REFERENCES "revenue_pools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_revenue_distributions_founderId" FOREIGN KEY ("founderId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_revenue_distributions_month" ON "revenue_distributions" ("month")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_revenue_distributions_pool_founder" ON "revenue_distributions" ("poolId", "founderId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "payment_webhook_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "provider" "transaction_provider_enum" NOT NULL,
        "eventType" varchar,
        "externalRef" varchar,
        "externalEventId" varchar,
        "processed" boolean NOT NULL DEFAULT false,
        "headers" jsonb,
        "payload" jsonb,
        "errorMessage" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_payment_webhook_logs_provider_externalEventId" ON "payment_webhook_logs" ("provider", "externalEventId") WHERE "externalEventId" IS NOT NULL`,
    );

    await queryRunner.query(`
      CREATE TABLE "founders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE,
        "founderNumber" integer NOT NULL UNIQUE,
        "lifetimePremium" boolean NOT NULL DEFAULT true,
        "revenueSharingEligible" boolean NOT NULL DEFAULT false,
        "revenueSharingActivatedAt" timestamptz,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_founders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_founders_userId" ON "founders" ("userId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_founders_founderNumber" ON "founders" ("founderNumber")`,
    );
    await queryRunner.query(
      `ALTER TABLE "founders" ADD CONSTRAINT "CHK_founders_founderNumber_cap" CHECK ("founderNumber" BETWEEN 1 AND 2500)`,
    );

    await queryRunner.query(`
      CREATE TABLE "system_settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" varchar NOT NULL UNIQUE,
        "value" jsonb NOT NULL,
        "isPublic" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "feature_flags" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" varchar NOT NULL UNIQUE,
        "enabled" boolean NOT NULL DEFAULT false,
        "rules" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" varchar NOT NULL,
        "actorUserId" uuid,
        "targetType" varchar,
        "targetId" uuid,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feature_flags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "system_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "founders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_webhook_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "revenue_distributions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "revenue_pools"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "referral_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "marriage_stakes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staking_contracts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gifts_sent"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gift_catalog"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_participants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_rooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matchmaking_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "swipe_actions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_prompts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profile_media"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "media_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "matchmaking_session_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "marriage_stake_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "staking_contract_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "revenue_distribution_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "revenue_pool_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "referral_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_currency_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "message_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "match_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "swipe_action_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_tier_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "verification_status_enum"`);
  }
}

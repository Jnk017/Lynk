import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSafetyModerationFoundation1780680000000 implements MigrationInterface {
  name = 'AddSafetyModerationFoundation1780680000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "report_reason_enum" AS ENUM ('fake_profile','scam_attempt','harassment','inappropriate_content','impersonation','underage_concern','spam','other'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "details" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "evidenceNote" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "resolutionNote" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "moderatorId" uuid`,
    );
    await queryRunner.query(
      `UPDATE "reports" SET "resolutionNote" = "resolution" WHERE "resolutionNote" IS NULL AND "resolution" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "reports" SET "moderatorId" = "resolvedById" WHERE "moderatorId" IS NULL AND "resolvedById" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "reports" SET "reason" = 'other' WHERE "reason" IS NULL OR "reason" NOT IN ('fake_profile','scam_attempt','harassment','inappropriate_content','impersonation','underage_concern','spam','other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "reason" TYPE "report_reason_enum" USING "reason"::"report_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "reason" SET NOT NULL`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "reports" ADD CONSTRAINT "FK_reports_moderatorId" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockerId" uuid NOT NULL, "blockedUserId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_user_blocks_pair" UNIQUE ("blockerId", "blockedUserId"), CONSTRAINT "CHK_user_blocks_not_self" CHECK ("blockerId" <> "blockedUserId"), CONSTRAINT "PK_user_blocks" PRIMARY KEY ("id"), CONSTRAINT "FK_user_blocks_blocker" FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE, CONSTRAINT "FK_user_blocks_blocked" FOREIGN KEY ("blockedUserId") REFERENCES "users"("id") ON DELETE CASCADE)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_blocks_blockerId" ON "user_blocks" ("blockerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_blocks_blockedUserId" ON "user_blocks" ("blockedUserId")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_blocks"`);
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "FK_reports_moderatorId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "reason" TYPE character varying USING "reason"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP COLUMN IF EXISTS "moderatorId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP COLUMN IF EXISTS "resolutionNote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP COLUMN IF EXISTS "evidenceNote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP COLUMN IF EXISTS "details"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "report_reason_enum"`);
  }
}

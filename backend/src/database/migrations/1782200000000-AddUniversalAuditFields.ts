import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniversalAuditFields1782200000000 implements MigrationInterface {
  name = 'AddUniversalAuditFields1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "actorId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "resourceType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "resourceId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ipAddress" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "userAgent" character varying`,
    );
    await queryRunner.query(
      `UPDATE "audit_logs" SET "actorId" = "actorUserId" WHERE "actorId" IS NULL AND "actorUserId" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "audit_logs" SET "resourceType" = "targetType" WHERE "resourceType" IS NULL AND "targetType" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "audit_logs" SET "resourceId" = "targetId" WHERE "resourceId" IS NULL AND "targetId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "userAgent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "ipAddress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "resourceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "resourceType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "actorId"`,
    );
  }
}

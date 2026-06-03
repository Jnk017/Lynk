import { MigrationInterface, QueryRunner } from 'typeorm';

export class HardenRevenueSharingIdempotency1764698800000 implements MigrationInterface {
  name = 'HardenRevenueSharingIdempotency1764698800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "revenue_pool_status_enum" ADD VALUE IF NOT EXISTS 'processing'`,
    );
    await queryRunner.query(
      `ALTER TYPE "revenue_pool_status_enum" ADD VALUE IF NOT EXISTS 'failed'`,
    );
    await queryRunner.query(
      `ALTER TYPE "revenue_pool_status_enum" ADD VALUE IF NOT EXISTS 'cancelled'`,
    );
    await queryRunner.query(
      `ALTER TYPE "revenue_distribution_status_enum" ADD VALUE IF NOT EXISTS 'processing'`,
    );
    await queryRunner.query(
      `ALTER TYPE "revenue_distribution_status_enum" ADD VALUE IF NOT EXISTS 'cancelled'`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_pools" ADD COLUMN IF NOT EXISTS "idempotencyKey" varchar`,
    );
    await queryRunner.query(
      `UPDATE "revenue_pools" SET "idempotencyKey" = 'revenue_distribution:' || "period" WHERE "idempotencyKey" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_pools" ALTER COLUMN "idempotencyKey" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_revenue_pools_idempotencyKey" ON "revenue_pools" ("idempotencyKey")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_revenue_distributions_month_founder" ON "revenue_distributions" ("month", "founderId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_revenue_distributions_month_founder"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_revenue_pools_idempotencyKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_pools" DROP COLUMN IF EXISTS "idempotencyKey"`,
    );
  }
}

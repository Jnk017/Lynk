import { MigrationInterface, QueryRunner } from 'typeorm';

export class HardenPaymentStatesAndProviderSecrets1782100000000 implements MigrationInterface {
  name = 'HardenPaymentStatesAndProviderSecrets1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "transaction_status_enum" ADD VALUE IF NOT EXISTS 'processing'`,
    );
    await queryRunner.query(
      `ALTER TYPE "transaction_status_enum" ADD VALUE IF NOT EXISTS 'expired'`,
    );
    await queryRunner.query(
      `ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'support'`,
    );
    await queryRunner.query(
      `ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'finance'`,
    );
    await queryRunner.query(
      `ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'compliance'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_blocks" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "legal_acceptances" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "legal_acceptances" DROP COLUMN IF EXISTS "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_blocks" DROP COLUMN IF EXISTS "deletedAt"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CanonicalPiUid1766229200000 implements MigrationInterface {
  name = 'CanonicalPiUid1766229200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "users" SET "piUid" = "piWalletAddress" WHERE "piUid" IS NULL AND "piWalletAddress" IS NOT NULL');
    await queryRunner.query('UPDATE "users" SET "piWalletAddress" = NULL WHERE "piWalletAddress" = "piUid"');
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_piUid_unique" ON "users" ("piUid") WHERE "piUid" IS NOT NULL');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_users_piUid_lookup" ON "users" ("piUid") WHERE "piUid" IS NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_piUid_lookup"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_piUid_unique"');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppChannelToCoreEntities1782300000000 implements MigrationInterface {
  name = 'AddAppChannelToCoreEntities1782300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "app_channel_enum" AS ENUM ('PI_ECOSYSTEM', 'GLOBAL'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "registrationChannel" "app_channel_enum" NOT NULL DEFAULT 'GLOBAL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastChannelUsed" "app_channel_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "piUid" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "piUsername" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_piUid" ON "users" ("piUid") WHERE "piUid" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_registrationChannel" ON "users" ("registrationChannel")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_lastChannelUsed" ON "users" ("lastChannelUsed")`,
    );

    for (const table of [
      'transactions',
      'legal_acceptances',
      'audit_logs',
      'payment_webhook_logs',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "channel" "app_channel_enum" NOT NULL DEFAULT 'GLOBAL'`,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_${table}_channel" ON "${table}" ("channel")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'payment_webhook_logs',
      'audit_logs',
      'legal_acceptances',
      'transactions',
    ]) {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_channel"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "channel"`,
      );
    }
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_lastChannelUsed"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_users_registrationChannel"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_piUid"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "piUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "piUid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "lastChannelUsed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "registrationChannel"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "app_channel_enum"`);
  }
}

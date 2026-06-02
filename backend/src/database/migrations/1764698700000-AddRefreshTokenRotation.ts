import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenRotation1764698700000 implements MigrationInterface {
  name = 'AddRefreshTokenRotation1764698700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY,
        "userId" uuid NOT NULL,
        "tokenHash" varchar NOT NULL,
        "deviceId" varchar,
        "userAgent" varchar,
        "ipAddress" varchar,
        "expiresAt" timestamptz NOT NULL,
        "lastUsedAt" timestamptz,
        "revokedAt" timestamptz,
        "replacedByTokenId" uuid,
        "reuseDetectedAt" timestamptz,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_deviceId" ON "refresh_tokens" ("deviceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_revokedAt" ON "refresh_tokens" ("revokedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
  }
}

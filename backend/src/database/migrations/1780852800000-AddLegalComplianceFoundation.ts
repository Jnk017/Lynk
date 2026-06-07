import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLegalComplianceFoundation1780852800000 implements MigrationInterface {
  name = 'AddLegalComplianceFoundation1780852800000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "legal_acceptances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "documentType" character varying(50) NOT NULL, "documentVersion" character varying(20) NOT NULL, "language" character varying(5) NOT NULL, "acceptedAt" TIMESTAMP NOT NULL DEFAULT now(), "ipAddress" character varying, "userAgent" text, "revokedAt" TIMESTAMP, CONSTRAINT "PK_legal_acceptances" PRIMARY KEY ("id"), CONSTRAINT "FK_legal_acceptances_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_legal_acceptances_userId" ON "legal_acceptances" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_legal_acceptances_lookup" ON "legal_acceptances" ("userId", "documentType", "documentVersion")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "deletionRequestedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "deletionScheduledFor" TIMESTAMP`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "deletionScheduledFor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "deletionRequestedAt"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "legal_acceptances"`);
  }
}

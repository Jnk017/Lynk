import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRbacAdminAndReports1764698900000 implements MigrationInterface {
  name = 'AddRbacAdminAndReports1764698900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "user_role_enum" AS ENUM ('user', 'premium_user', 'founder', 'moderator', 'admin', 'super_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "user_role_enum" NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role")`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "report_status_enum" AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "reporterId" uuid NOT NULL,
        "reportedUserId" uuid NOT NULL,
        "reason" varchar,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "status" "report_status_enum" NOT NULL DEFAULT 'pending',
        "resolution" varchar,
        "resolvedById" uuid,
        "resolvedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT "FK_reports_reporterId" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_reportedUserId" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_resolvedById" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_status" ON "reports" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_reporterId" ON "reports" ("reporterId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_reportedUserId" ON "reports" ("reportedUserId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reports"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "report_status_enum"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}

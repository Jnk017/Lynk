import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePiPayments1782300100000 implements MigrationInterface {
  name = 'CreatePiPayments1782300100000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "pi_payment_status_enum" AS ENUM ('CREATED','PENDING_APPROVAL','APPROVED','PENDING_COMPLETION','COMPLETED','CANCELLED','FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pi_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "paymentId" character varying NOT NULL, "txid" character varying, "amountPi" numeric(18,8) NOT NULL DEFAULT '0', "memo" character varying NOT NULL DEFAULT 'Lynk purchase', "productId" character varying NOT NULL, "productType" character varying NOT NULL, "status" "pi_payment_status_enum" NOT NULL DEFAULT 'CREATED', "rawPayment" jsonb, "rawApprovalResponse" jsonb, "rawCompletionResponse" jsonb, "errorCode" character varying, "errorMessage" character varying, "channel" "app_channel_enum" NOT NULL DEFAULT 'PI_ECOSYSTEM', "approvedAt" TIMESTAMP, "completedAt" TIMESTAMP, "cancelledAt" TIMESTAMP, "failedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_pi_payments" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pi_payments_paymentId" ON "pi_payments" ("paymentId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pi_payments_txid" ON "pi_payments" ("txid") WHERE "txid" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pi_payments_channel" ON "pi_payments" ("channel")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pi_payments_userId" ON "pi_payments" ("userId")`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pi_payments_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pi_payments_channel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pi_payments_txid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pi_payments_paymentId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pi_payments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "pi_payment_status_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPawapayAndBinancePayProviders1782000000000
  implements MigrationInterface
{
  name = 'AddPawapayAndBinancePayProviders1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "transaction_provider_enum" ADD VALUE IF NOT EXISTS 'pawapay'`,
    );
    await queryRunner.query(
      `ALTER TYPE "transaction_provider_enum" ADD VALUE IF NOT EXISTS 'binance_pay'`,
    );
  }

  public async down(): Promise<void> {
    // PostgreSQL enum values cannot be removed safely after being added.
  }
}

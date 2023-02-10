import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedRewardNameColumnToWalletTransactions1675189321618
  implements MigrationInterface
{
  name = 'addedRewardNameColumnToWalletTransactions1675189321618'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "reward_name" character varying`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "reward_name"`
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class replacedLeagueFieldWithLeagueIdInWalletTransactions1674819355931
  implements MigrationInterface
{
  name = 'replacedLeagueFieldWithLeagueIdInWalletTransactions1674819355931'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_46bb751930381436a2a0714395e"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "REL_46bb751930381436a2a0714395"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "leagueId"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "league_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "league_name" character varying`
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
      `ALTER TABLE "wallet_transaction" DROP COLUMN "league_name"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "league_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "leagueId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "REL_46bb751930381436a2a0714395" UNIQUE ("leagueId")`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_46bb751930381436a2a0714395e" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

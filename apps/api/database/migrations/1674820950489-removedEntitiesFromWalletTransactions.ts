import { MigrationInterface, QueryRunner } from 'typeorm'

export class removedEntitiesFromWalletTransactions1674820950489
  implements MigrationInterface
{
  name = 'removedEntitiesFromWalletTransactions1674820950489'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_26fb4db916c1f56c58f650bba33"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_52d3d20a08c449f9362aac851f2"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_9e2d2b9e0c8ea2b842d0c05c622"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "REL_52d3d20a08c449f9362aac851f"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "earningsId"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "REL_9e2d2b9e0c8ea2b842d0c05c62"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "claimId"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "REL_26fb4db916c1f56c58f650bba3"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "rewardRedemptionId"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "earnings_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "claim_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "reward_redemption_id" character varying`
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
      `ALTER TABLE "wallet_transaction" DROP COLUMN "reward_redemption_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "claim_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "earnings_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "rewardRedemptionId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "REL_26fb4db916c1f56c58f650bba3" UNIQUE ("rewardRedemptionId")`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "claimId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "REL_9e2d2b9e0c8ea2b842d0c05c62" UNIQUE ("claimId")`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "earningsId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "REL_52d3d20a08c449f9362aac851f" UNIQUE ("earningsId")`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_9e2d2b9e0c8ea2b842d0c05c622" FOREIGN KEY ("claimId") REFERENCES "league_bfit_claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_52d3d20a08c449f9362aac851f2" FOREIGN KEY ("earningsId") REFERENCES "league_bfit_earnings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_26fb4db916c1f56c58f650bba33" FOREIGN KEY ("rewardRedemptionId") REFERENCES "rewards_redemption"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

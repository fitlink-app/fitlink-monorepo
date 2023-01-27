import { MigrationInterface, QueryRunner } from 'typeorm'

export class convertUserFieldToUserId1674820498271
  implements MigrationInterface
{
  name = 'convertUserFieldToUserId1674820498271'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_9071d3c9266c4521bdafe29307a"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" RENAME COLUMN "userId" TO "user_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" RENAME CONSTRAINT "REL_9071d3c9266c4521bdafe29307" TO "UQ_1b321310b8544083f5811cd2282"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP CONSTRAINT "UQ_1b321310b8544083f5811cd2282"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "user_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "user_id" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" DROP COLUMN "user_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD "user_id" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "UQ_1b321310b8544083f5811cd2282" UNIQUE ("user_id")`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" RENAME CONSTRAINT "UQ_1b321310b8544083f5811cd2282" TO "REL_9071d3c9266c4521bdafe29307"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" RENAME COLUMN "user_id" TO "userId"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_9071d3c9266c4521bdafe29307a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

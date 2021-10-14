import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBillingSubscriptionId1632316578136
  implements MigrationInterface {
  name = 'AddBillingSubscriptionId1632316578136'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_subscription_id" character varying`
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
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_subscription_id"`
    )
  }
}

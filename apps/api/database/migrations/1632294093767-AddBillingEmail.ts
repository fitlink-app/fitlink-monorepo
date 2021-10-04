import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBillingEmail1632294093767 implements MigrationInterface {
  name = 'AddBillingEmail1632294093767'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_email" character varying DEFAULT ''`
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
      `ALTER TABLE "subscription" DROP COLUMN "billing_email"`
    )
  }
}

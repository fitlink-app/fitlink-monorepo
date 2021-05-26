import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserToActivities1622016153101 implements MigrationInterface {
  name = 'AddUserToActivities1622016153101'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "user_id" character varying`
    )
    await queryRunner.query(`ALTER TABLE "activity" ADD "userId" uuid`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_address_1" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_address_1" SET DEFAULT ''`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_address_2" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_address_2" SET DEFAULT ''`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_country" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_country" SET DEFAULT ''`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_state" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_state" SET DEFAULT ''`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_city" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_city" SET DEFAULT ''`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_postcode" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_postcode" SET DEFAULT ''`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_postcode" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_postcode" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_city" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_city" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_state" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_state" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_country" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_country" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_address_2" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_address_2" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_address_1" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_address_1" IS NULL`
    )
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "userId"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "user_id"`)
  }
}

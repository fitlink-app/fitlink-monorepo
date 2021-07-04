import { MigrationInterface, QueryRunner } from 'typeorm'

export class RewardsUpdates1625057321096 implements MigrationInterface {
  name = 'RewardsUpdates1625057321096'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "public"`)
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "units_available" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "limit_units" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "platform" character varying NOT NULL DEFAULT 'fitlink'`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "access" character varying NOT NULL DEFAULT 'public'`
    )
    await queryRunner.query(`ALTER TABLE "reward" ADD "organisationId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "reward" ALTER COLUMN "redeem_url" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "reward"."redeem_url" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "reward"."redeemed_count" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ALTER COLUMN "redeemed_count" SET DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD CONSTRAINT "FK_6f9c0754545f59d8444c567f32e" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward" DROP CONSTRAINT "FK_6f9c0754545f59d8444c567f32e"`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ALTER COLUMN "redeemed_count" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "reward"."redeemed_count" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "reward"."redeem_url" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "reward" ALTER COLUMN "redeem_url" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "organisationId"`)
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "access"`)
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "platform"`)
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "limit_units"`)
    await queryRunner.query(
      `ALTER TABLE "reward" DROP COLUMN "units_available"`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "public" boolean NOT NULL`
    )
  }
}

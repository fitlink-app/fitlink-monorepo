import { MigrationInterface, QueryRunner } from 'typeorm'

export class RolesSubscriptions1616348704248 implements MigrationInterface {
  name = 'RolesSubscriptions1616348704248'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_role" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "role" character varying NOT NULL, "userId" uuid, "organisationId" uuid, "teamId" uuid, "subscriptionId" uuid, CONSTRAINT "REL_193583afce6eec8c231c706154" UNIQUE ("organisationId"), CONSTRAINT "REL_a4c2299ebc53e9b7c3ccbb4d9e" UNIQUE ("teamId"), CONSTRAINT "REL_55d26680dcdc4f3c15c2f433b2" UNIQUE ("subscriptionId"), CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "subscription_type_enum" AS ENUM('Trial30day', 'Trial90day', 'dynamic')`
    )
    await queryRunner.query(
      `CREATE TABLE "subscription" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "billing_entity" character varying NOT NULL, "billing_address_1" character varying, "billing_address_2" character varying, "billing_country" character varying, "billing_country_code" character varying, "billing_state" character varying, "billing_city" character varying NOT NULL, "billing_postcode" character varying, "type" "subscription_type_enum" NOT NULL DEFAULT 'Trial30day', "default" boolean NOT NULL DEFAULT false, "organisationId" uuid, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_address_1"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_address_2"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_country"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_country_code"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_state"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "billing_city"`
    )
    await queryRunner.query(`ALTER TABLE "user" ADD "subscriptionId" uuid`)
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(Point)`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_193583afce6eec8c231c7061540" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_f1d3ffb910b5c1a9052df7c1833" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_ad0626565f11a0d3367a7a6268e" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_ad0626565f11a0d3367a7a6268e"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_f1d3ffb910b5c1a9052df7c1833"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_193583afce6eec8c231c7061540"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(POINT,0)`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscriptionId"`)
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_city" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_state" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_country_code" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_country" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_address_2" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "billing_address_1" character varying`
    )
    await queryRunner.query(`DROP TABLE "subscription"`)
    await queryRunner.query(`DROP TYPE "subscription_type_enum"`)
    await queryRunner.query(`DROP TABLE "user_role"`)
  }
}

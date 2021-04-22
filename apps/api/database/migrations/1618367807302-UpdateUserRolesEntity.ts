import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserRolesEntity1618367807302 implements MigrationInterface {
  name = 'UpdateUserRolesEntity1618367807302'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_193583afce6eec8c231c7061540"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561"`
    )
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "user_role"."organisationId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "REL_193583afce6eec8c231c706154"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "user_role"."teamId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "REL_a4c2299ebc53e9b7c3ccbb4d9e"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "user_role"."subscriptionId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "REL_55d26680dcdc4f3c15c2f433b2"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_193583afce6eec8c231c7061540" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_193583afce6eec8c231c7061540"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "REL_55d26680dcdc4f3c15c2f433b2" UNIQUE ("subscriptionId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "user_role"."subscriptionId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "REL_a4c2299ebc53e9b7c3ccbb4d9e" UNIQUE ("teamId")`
    )
    await queryRunner.query(`COMMENT ON COLUMN "user_role"."teamId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "REL_193583afce6eec8c231c706154" UNIQUE ("organisationId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "user_role"."organisationId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561"`
    )
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "user_role" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_55d26680dcdc4f3c15c2f433b21" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_a4c2299ebc53e9b7c3ccbb4d9e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_193583afce6eec8c231c7061540" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

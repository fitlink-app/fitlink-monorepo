import { MigrationInterface, QueryRunner } from 'typeorm'

export class OrganisationMode1632771719624 implements MigrationInterface {
  name = 'OrganisationMode1632771719624'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "organisation_mode_enum" AS ENUM('simple', 'complex')`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "mode" "organisation_mode_enum" NOT NULL DEFAULT 'simple'`
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
    await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "mode"`)
    await queryRunner.query(`DROP TYPE "organisation_mode_enum"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTeamJoinCode1632688836338 implements MigrationInterface {
  name = 'AddTeamJoinCode1632688836338'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" ADD "join_code" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "UQ_e7080cbe576f5f1b86bbdfbef1f" UNIQUE ("join_code")`
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
      `ALTER TABLE "team" DROP CONSTRAINT "UQ_e7080cbe576f5f1b86bbdfbef1f"`
    )
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "join_code"`)
  }
}

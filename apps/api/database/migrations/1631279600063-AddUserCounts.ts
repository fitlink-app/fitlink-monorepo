import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserCounts1631279600063 implements MigrationInterface {
  name = 'AddUserCounts1631279600063'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "user_count" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "team" ADD "user_count" integer NOT NULL DEFAULT '0'`
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
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "user_count"`)
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "user_count"`
    )
  }
}

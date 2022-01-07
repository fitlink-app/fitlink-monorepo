import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUtcOffsetToHealthActivities1641556069365
  implements MigrationInterface
{
  name = 'AddUtcOffsetToHealthActivities1641556069365'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD "utc_offset" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."goal_active_minutes" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."goal_active_minutes" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP COLUMN "utc_offset"`
    )
  }
}

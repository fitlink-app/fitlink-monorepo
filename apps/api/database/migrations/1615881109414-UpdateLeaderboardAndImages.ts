import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateLeaderboardAndImages1615881109414
  implements MigrationInterface {
  name = 'UpdateLeaderboardAndImages1615881109414'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "raw_url"`)
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "original_width"`)
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "original_height"`)
    await queryRunner.query(
      `ALTER TABLE "image" ADD "url_640x360" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD "deleted_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."image_type_enum" RENAME TO "image_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "image_type_enum" AS ENUM('avatar', 'cover', 'standard', 'tile')`
    )
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" TYPE "image_type_enum" USING "type"::"text"::"image_type_enum"`
    )
    await queryRunner.query(`DROP TYPE "image_type_enum_old"`)
    await queryRunner.query(`COMMENT ON COLUMN "image"."type" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "leaderboard_entry"."points" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ALTER COLUMN "points" SET DEFAULT '0'`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leaderboard_entry"."wins" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ALTER COLUMN "wins" SET DEFAULT '0'`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(Point)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(POINT,0)`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ALTER COLUMN "wins" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leaderboard_entry"."wins" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ALTER COLUMN "points" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leaderboard_entry"."points" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "image"."type" IS NULL`)
    await queryRunner.query(
      `CREATE TYPE "image_type_enum_old" AS ENUM('avatar', 'cover')`
    )
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" TYPE "image_type_enum_old" USING "type"::"text"::"image_type_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "image_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "image_type_enum_old" RENAME TO  "image_type_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP COLUMN "deleted_at"`
    )
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "url_640x360"`)
    await queryRunner.query(
      `ALTER TABLE "image" ADD "original_height" integer NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "image" ADD "original_width" integer NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "image" ADD "raw_url" character varying NOT NULL`
    )
  }
}

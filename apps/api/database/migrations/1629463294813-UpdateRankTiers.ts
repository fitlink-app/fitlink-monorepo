import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateRankTiers1629463294813 implements MigrationInterface {
  name = 'UpdateRankTiers1629463294813'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."user_rank_enum" RENAME TO "user_rank_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "user_rank_enum" AS ENUM('Fitlink Newbie', 'Fitlink Sportstar', 'Fitlink Semi-pro', 'Fitlink Pro')`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" TYPE "user_rank_enum" USING "rank"::"text"::"user_rank_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" SET DEFAULT 'Fitlink Newbie'`
    )
    await queryRunner.query(`DROP TYPE "user_rank_enum_old"`)
    await queryRunner.query(`COMMENT ON COLUMN "user"."rank" IS NULL`)
    await queryRunner.query(
      `ALTER TYPE "public"."feed_item_tier_enum" RENAME TO "feed_item_tier_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_tier_enum" AS ENUM('Fitlink Newbie', 'Fitlink Sportstar', 'Fitlink Semi-pro', 'Fitlink Pro')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ALTER COLUMN "tier" TYPE "feed_item_tier_enum" USING "tier"::"text"::"feed_item_tier_enum"`
    )
    await queryRunner.query(`DROP TYPE "feed_item_tier_enum_old"`)
    await queryRunner.query(`COMMENT ON COLUMN "feed_item"."tier" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "feed_item"."tier" IS NULL`)
    await queryRunner.query(
      `CREATE TYPE "feed_item_tier_enum_old" AS ENUM('Fitlink Newbie', 'Fitlink Pro')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ALTER COLUMN "tier" TYPE "feed_item_tier_enum_old" USING "tier"::"text"::"feed_item_tier_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "feed_item_tier_enum"`)
    await queryRunner.query(
      `ALTER TYPE "feed_item_tier_enum_old" RENAME TO  "feed_item_tier_enum"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "user"."rank" IS NULL`)
    await queryRunner.query(
      `CREATE TYPE "user_rank_enum_old" AS ENUM('Fitlink Newbie')`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" TYPE "user_rank_enum_old" USING "rank"::"text"::"user_rank_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "rank" SET DEFAULT 'Fitlink Newbie'`
    )
    await queryRunner.query(`DROP TYPE "user_rank_enum"`)
    await queryRunner.query(
      `ALTER TYPE "user_rank_enum_old" RENAME TO  "user_rank_enum"`
    )
  }
}

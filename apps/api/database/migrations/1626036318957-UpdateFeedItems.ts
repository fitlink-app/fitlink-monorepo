import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateFeedItems1626036318957 implements MigrationInterface {
  name = 'UpdateFeedItems1626036318957'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "group"`)
    await queryRunner.query(`DROP TYPE "public"."feed_item_group_enum"`)
    await queryRunner.query(
      `CREATE TYPE "feed_item_type_enum" AS ENUM('daily_goal_reached', 'health_activity', 'new_follower', 'league_joined', 'league_ending', 'league_won', 'league_reset', 'reward_unlocked', 'reward_claimed', 'tier_up', 'tier_down')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "type" "feed_item_type_enum" NOT NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_tier_enum" AS ENUM('Fitlink Newbie', 'Fitlink Pro')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "tier" "feed_item_tier_enum"`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "rewardId" uuid`)
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "relatedUserId" uuid`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_a62adf69652859b6af131eadb1e" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c" FOREIGN KEY ("relatedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_a62adf69652859b6af131eadb1e"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP COLUMN "relatedUserId"`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "rewardId"`)
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "tier"`)
    await queryRunner.query(`DROP TYPE "feed_item_tier_enum"`)
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "feed_item_type_enum"`)
    await queryRunner.query(
      `CREATE TYPE "public"."feed_item_group_enum" AS ENUM('daily_goal_reached', 'health_activity', 'new_follower', 'league_joined', 'league_ending', 'league_won', 'league_reset', 'reward_unlocked', 'reward_claimed', 'tier_up', 'tier_down')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "group" "feed_item_group_enum" NOT NULL`
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class SchemaUpdates1625941631377 implements MigrationInterface {
  name = 'SchemaUpdates1625941631377'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_2c0c26f18495c64ed1ebdeb41d9"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_89b8906d1f1e378646460b23f7a"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_f8116b854f18829d8227971199e"`
    )
    await queryRunner.query(
      `CREATE TABLE "firebase_migration" ("firebase_id" character varying NOT NULL, "entity_id" uuid NOT NULL, CONSTRAINT "PK_b9af50b716ef27b22e8502f4beb" PRIMARY KEY ("firebase_id"))`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "event"`)
    await queryRunner.query(`DROP TYPE "public"."feed_item_event_enum"`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "REL_f8116b854f18829d8227971199"`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "imageId"`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "REL_7c7f5a4626dd76413d55c33da4"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP COLUMN "relatedUserId"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "REL_2c0c26f18495c64ed1ebdeb41d"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP COLUMN "relatedHealthActivityId"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "REL_89b8906d1f1e378646460b23f7"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP COLUMN "relatedGoalsEntryId"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard" ADD "completed" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_first_name" character varying DEFAULT ''`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_last_name" character varying DEFAULT ''`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_currency_code" character varying NOT NULL DEFAULT 'GBP'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_customer_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_status" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_trial_end_date" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_last_billed_month" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "subscription_starts_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "redeem_instructions" character varying`
    )
    await queryRunner.query(`ALTER TABLE "league" ADD "feedItemsId" uuid`)
    await queryRunner.query(`ALTER TABLE "goals_entry" ADD "feedItemsId" uuid`)
    await queryRunner.query(`ALTER TABLE "user" ADD "fcm_tokens" json`)
    await queryRunner.query(
      `CREATE TYPE "feed_item_category_enum" AS ENUM('my_activities', 'my_goals', 'my_updates', 'friends_activities')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "category" "feed_item_category_enum" NOT NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_goal_type_enum" AS ENUM('steps', 'floors_climbed', 'water_litres', 'sleep_hours', 'mindfulness_minutes')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "goal_type" "feed_item_goal_type_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "healthActivityId" uuid`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "leagueId" uuid`)
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "goalEntryId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD "feedItemsId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_entity" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_entity" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_entity" SET DEFAULT ''`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."subscription_type_enum" RENAME TO "subscription_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "subscription_type_enum" AS ENUM('Trial14day', 'Trial30day', 'Trial90day', 'dynamic', 'free')`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" TYPE "subscription_type_enum" USING "type"::"text"::"subscription_type_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" SET DEFAULT 'Trial14day'`
    )
    await queryRunner.query(`DROP TYPE "subscription_type_enum_old"`)
    await queryRunner.query(`COMMENT ON COLUMN "subscription"."type" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" SET DEFAULT 'Trial14day'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "refresh_token" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."refresh_token" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "token" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "provider"."token" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "token_expires_at" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."token_expires_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "scopes" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "provider"."scopes" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "provider_user_id" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."provider_user_id" IS NULL`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."users_setting_privacy_daily_statistics_enum" RENAME TO "users_setting_privacy_daily_statistics_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_daily_statistics_enum" AS ENUM('private', 'following', 'public')`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" TYPE "users_setting_privacy_daily_statistics_enum" USING "privacy_daily_statistics"::"text"::"users_setting_privacy_daily_statistics_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" SET DEFAULT 'public'`
    )
    await queryRunner.query(
      `DROP TYPE "users_setting_privacy_daily_statistics_enum_old"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "users_setting"."privacy_daily_statistics" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" SET DEFAULT 'public'`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."users_setting_privacy_activities_enum" RENAME TO "users_setting_privacy_activities_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_activities_enum" AS ENUM('private', 'following', 'public')`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" TYPE "users_setting_privacy_activities_enum" USING "privacy_activities"::"text"::"users_setting_privacy_activities_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" SET DEFAULT 'public'`
    )
    await queryRunner.query(
      `DROP TYPE "users_setting_privacy_activities_enum_old"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "users_setting"."privacy_activities" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" SET DEFAULT 'public'`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."feed_item_group_enum" RENAME TO "feed_item_group_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_group_enum" AS ENUM('daily_goal_reached', 'health_activity', 'new_follower', 'league_joined', 'league_ending', 'league_won', 'league_reset', 'reward_unlocked', 'reward_claimed', 'tier_up', 'tier_down')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ALTER COLUMN "group" TYPE "feed_item_group_enum" USING "group"::"text"::"feed_item_group_enum"`
    )
    await queryRunner.query(`DROP TYPE "feed_item_group_enum_old"`)
    await queryRunner.query(`COMMENT ON COLUMN "feed_item"."group" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "health_activity"."calories" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ALTER COLUMN "calories" SET DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP COLUMN "quantity"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD "quantity" double precision`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ALTER COLUMN "polyline" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "health_activity"."polyline" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_33688826f9febe9e1efc25cf0d3" FOREIGN KEY ("feedItemsId") REFERENCES "feed_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD CONSTRAINT "FK_8b77e3e7abea8b661ea37a25c33" FOREIGN KEY ("feedItemsId") REFERENCES "feed_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_906d31029e1fff5584deca45646" FOREIGN KEY ("healthActivityId") REFERENCES "health_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_5205d9f912bdccdb7b9de9d0568" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_7dab540c83e239d0a63b7f92158" FOREIGN KEY ("goalEntryId") REFERENCES "goals_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_52d99d3ad16f7a89fa3aef9c7ce" FOREIGN KEY ("feedItemsId") REFERENCES "feed_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_52d99d3ad16f7a89fa3aef9c7ce"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_7dab540c83e239d0a63b7f92158"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_5205d9f912bdccdb7b9de9d0568"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_906d31029e1fff5584deca45646"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP CONSTRAINT "FK_8b77e3e7abea8b661ea37a25c33"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_33688826f9febe9e1efc25cf0d3"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "health_activity"."polyline" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ALTER COLUMN "polyline" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP COLUMN "quantity"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD "quantity" integer`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ALTER COLUMN "calories" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "health_activity"."calories" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "feed_item"."group" IS NULL`)
    await queryRunner.query(
      `CREATE TYPE "feed_item_group_enum_old" AS ENUM('user_activity', 'user_goal')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ALTER COLUMN "group" TYPE "feed_item_group_enum_old" USING "group"::"text"::"feed_item_group_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "feed_item_group_enum"`)
    await queryRunner.query(
      `ALTER TYPE "feed_item_group_enum_old" RENAME TO  "feed_item_group_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "users_setting"."privacy_activities" IS NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_activities_enum_old" AS ENUM('private', 'followers', 'public')`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" TYPE "users_setting_privacy_activities_enum_old" USING "privacy_activities"::"text"::"users_setting_privacy_activities_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_activities" SET DEFAULT 'public'`
    )
    await queryRunner.query(`DROP TYPE "users_setting_privacy_activities_enum"`)
    await queryRunner.query(
      `ALTER TYPE "users_setting_privacy_activities_enum_old" RENAME TO  "users_setting_privacy_activities_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "users_setting"."privacy_daily_statistics" IS NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_daily_statistics_enum_old" AS ENUM('private', 'followers', 'public')`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" TYPE "users_setting_privacy_daily_statistics_enum_old" USING "privacy_daily_statistics"::"text"::"users_setting_privacy_daily_statistics_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_setting" ALTER COLUMN "privacy_daily_statistics" SET DEFAULT 'public'`
    )
    await queryRunner.query(
      `DROP TYPE "users_setting_privacy_daily_statistics_enum"`
    )
    await queryRunner.query(
      `ALTER TYPE "users_setting_privacy_daily_statistics_enum_old" RENAME TO  "users_setting_privacy_daily_statistics_enum"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."provider_user_id" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "provider_user_id" SET NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "provider"."scopes" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "scopes" SET NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."token_expires_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "token_expires_at" SET NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "provider"."token" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "token" SET NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "provider"."refresh_token" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ALTER COLUMN "refresh_token" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" SET DEFAULT (CURRENT_TIMESTAMP + '1 day'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" SET NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" SET DEFAULT 'Trial30day'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "subscription"."type" IS NULL`)
    await queryRunner.query(
      `CREATE TYPE "subscription_type_enum_old" AS ENUM('Trial30day', 'Trial90day', 'dynamic')`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" TYPE "subscription_type_enum_old" USING "type"::"text"::"subscription_type_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "type" SET DEFAULT 'Trial14day'`
    )
    await queryRunner.query(`DROP TYPE "subscription_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "subscription_type_enum_old" RENAME TO  "subscription_type_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_entity" DROP DEFAULT`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_entity" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_entity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP COLUMN "feedItemsId"`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "goalEntryId"`)
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "leagueId"`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP COLUMN "healthActivityId"`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "goal_type"`)
    await queryRunner.query(`DROP TYPE "feed_item_goal_type_enum"`)
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "category"`)
    await queryRunner.query(`DROP TYPE "feed_item_category_enum"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fcm_tokens"`)
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "feedItemsId"`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "feedItemsId"`)
    await queryRunner.query(
      `ALTER TABLE "reward" DROP COLUMN "redeem_instructions"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "subscription_starts_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_last_billed_month"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_trial_end_date"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_status"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_customer_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_currency_code"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_last_name"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_first_name"`
    )
    await queryRunner.query(`ALTER TABLE "leaderboard" DROP COLUMN "completed"`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "relatedGoalsEntryId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "REL_89b8906d1f1e378646460b23f7" UNIQUE ("relatedGoalsEntryId")`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "relatedHealthActivityId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "REL_2c0c26f18495c64ed1ebdeb41d" UNIQUE ("relatedHealthActivityId")`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "relatedUserId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "REL_7c7f5a4626dd76413d55c33da4" UNIQUE ("relatedUserId")`
    )
    await queryRunner.query(`ALTER TABLE "feed_item" ADD "imageId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "REL_f8116b854f18829d8227971199" UNIQUE ("imageId")`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."feed_item_event_enum" AS ENUM('health_activity', 'new_follower', 'user_goal', 'won_league', 'joined_league', 'goal_hit', 'lifestyle_activity', 'reward_claimed')`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "event" "feed_item_event_enum" NOT NULL`
    )
    await queryRunner.query(`DROP TABLE "firebase_migration"`)
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_f8116b854f18829d8227971199e" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_89b8906d1f1e378646460b23f7a" FOREIGN KEY ("relatedGoalsEntryId") REFERENCES "goals_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c" FOREIGN KEY ("relatedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_2c0c26f18495c64ed1ebdeb41d9" FOREIGN KEY ("relatedHealthActivityId") REFERENCES "health_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

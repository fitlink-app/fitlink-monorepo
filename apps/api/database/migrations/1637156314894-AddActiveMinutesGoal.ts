import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActiveMinutesGoal1637156314894 implements MigrationInterface {
    name = 'AddActiveMinutesGoal1637156314894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goals_entry" ADD "current_active_minutes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ADD "target_active_minutes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "goal_active_minutes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TYPE "public"."feed_item_goal_type_enum" RENAME TO "feed_item_goal_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "feed_item_goal_type_enum" AS ENUM('steps', 'floors_climbed', 'water_litres', 'sleep_hours', 'mindfulness_minutes', 'active_minutes')`);
        await queryRunner.query(`ALTER TABLE "feed_item" ALTER COLUMN "goal_type" TYPE "feed_item_goal_type_enum" USING "goal_type"::"text"::"feed_item_goal_type_enum"`);
        await queryRunner.query(`DROP TYPE "feed_item_goal_type_enum_old"`);
        await queryRunner.query(`COMMENT ON COLUMN "feed_item"."goal_type" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "feed_item"."goal_type" IS NULL`);
        await queryRunner.query(`CREATE TYPE "feed_item_goal_type_enum_old" AS ENUM('steps', 'floors_climbed', 'water_litres', 'sleep_hours', 'mindfulness_minutes')`);
        await queryRunner.query(`ALTER TABLE "feed_item" ALTER COLUMN "goal_type" TYPE "feed_item_goal_type_enum_old" USING "goal_type"::"text"::"feed_item_goal_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "feed_item_goal_type_enum"`);
        await queryRunner.query(`ALTER TYPE "feed_item_goal_type_enum_old" RENAME TO  "feed_item_goal_type_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "goal_active_minutes"`);
        await queryRunner.query(`ALTER TABLE "goals_entry" DROP COLUMN "target_active_minutes"`);
        await queryRunner.query(`ALTER TABLE "goals_entry" DROP COLUMN "current_active_minutes"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UserWeekResetsAt1630413325975 implements MigrationInterface {
    name = 'UserWeekResetsAt1630413325975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "week_rest_at" TO "week_reset_at"`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "week_reset_at" TO "week_rest_at"`);
    }

}

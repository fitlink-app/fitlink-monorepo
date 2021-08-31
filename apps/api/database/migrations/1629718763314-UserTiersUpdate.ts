import {MigrationInterface, QueryRunner} from "typeorm";

export class UserTiersUpdate1629718763314 implements MigrationInterface {
    name = 'UserTiersUpdate1629718763314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "active_minutes_week" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "week_rest_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "week_rest_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "active_minutes_week"`);
    }

}

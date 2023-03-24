import {MigrationInterface, QueryRunner} from "typeorm";

export class addedLeagueWaitlistUserEntity1679511914515 implements MigrationInterface {
    name = 'addedLeagueWaitlistUserEntity1679511914515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "league_waitlist_user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "league_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_f77f2d6d2f071304c55a1070117" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`DROP TABLE "league_waitlist_user"`);
    }

}

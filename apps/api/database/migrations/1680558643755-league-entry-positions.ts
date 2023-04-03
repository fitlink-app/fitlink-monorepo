import {MigrationInterface, QueryRunner} from "typeorm";

export class leagueEntryPositions1680558643755 implements MigrationInterface {
    name = 'leagueEntryPositions1680558643755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "secondPlace" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "thirdPlace" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "lastLeaguePosition" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "lastLeaguePosition"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "thirdPlace"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "secondPlace"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class addedUserRankToLeagueEntity1676890518509 implements MigrationInterface {
    name = 'addedUserRankToLeagueEntity1676890518509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "league_user_rank_enum" AS ENUM('Fitlink Newbie', 'Fitlink Sportstar', 'Fitlink Semi-pro', 'Fitlink Pro')`);
        await queryRunner.query(`ALTER TABLE "league" ADD "user_rank" "league_user_rank_enum" NOT NULL DEFAULT 'Fitlink Newbie'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "user_rank"`);
        await queryRunner.query(`DROP TYPE "league_user_rank_enum"`);
    }

}

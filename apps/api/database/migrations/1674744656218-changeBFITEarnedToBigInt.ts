import {MigrationInterface, QueryRunner} from "typeorm";

export class changeBFITEarnedToBigInt1674744656218 implements MigrationInterface {
    name = 'changeBFITEarnedToBigInt1674744656218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_1c4377259edabe4e2aa4bc6db4"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_earned"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_earned" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_earned"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_earned" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX "IDX_1c4377259edabe4e2aa4bc6db4" ON "leaderboard_entry" ("bfit_earned") `);
    }

}

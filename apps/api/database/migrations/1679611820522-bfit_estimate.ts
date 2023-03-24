import {MigrationInterface, QueryRunner} from "typeorm";

export class bfitEstimate1679611820522 implements MigrationInterface {
    name = 'bfitEstimate1679611820522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_estimate" bigint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_estimate"`);
    }

}

import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class bitEstimateRetry1679698544661 implements MigrationInterface {
    name = 'bitEstimateRetry1679698544661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('leaderboard_entry')) {
            if (await queryRunner.hasColumn('leaderboard_entry', 'bfit_estimate')) {
                await queryRunner.dropColumn('leaderboard_entry', 'bfit_estimate')
            }
        }
        await queryRunner.addColumn('leaderboard_entry', new TableColumn({
            name: 'bfit_estimate',
            type: 'bigint',
            default: 0
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_estimate"`);
    }

}

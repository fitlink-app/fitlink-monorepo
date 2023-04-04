import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class bfitEstimateToNumeric1680633284291 implements MigrationInterface {
    name = 'bfitEstimateToNumeric1680633284291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.changeColumn(
            'leaderboard_entry',
            new TableColumn({
                name: 'bfit_estimate',
                type: 'bigint',
                default: 0,
            }),
            new TableColumn({
                name: 'bfit_estimate',
                type: 'numeric',
                precision: 20, // Set the desired precision
                scale: 10, // Set the desired scale
                default: 0,
            })
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.changeColumn(
            'leaderboard_entry',
            new TableColumn({
                name: 'bfit_estimate',
                type: 'numeric',
                precision: 20,
                scale: 10,
                default: 0,
            }),
            new TableColumn({
                name: 'bfit_estimate',
                type: 'bigint',
                default: 0,
            })
        );
    }

}

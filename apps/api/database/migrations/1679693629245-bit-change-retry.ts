import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class bitAllocationRetry1679693629245 implements MigrationInterface {
    name = 'bitAllocationRetry1679693629245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('league')) {

            if (await queryRunner.hasColumn('league', 'bfitAllocation')) {
                await queryRunner.dropColumn('league', 'bfitAllocation')
            }
            if (await queryRunner.hasColumn('league', 'bfitWinnerPot')) {
                await queryRunner.dropColumn('league', 'bfitWinnerPot')
            }
        }

        if (await queryRunner.hasTable('leaderboard_entry')) {
            if (await queryRunner.hasColumn('leaderboard_entry', 'bfit_estimate')) {
                await queryRunner.dropColumn('leaderboard_entry', 'bfit_estimate')
            }
        }
;
        if (await queryRunner.hasTable('league_waitlist_user')) {
            await queryRunner.dropTable('league_waitlist_user')
        }

        await queryRunner.addColumns('league', [
            new TableColumn({
                name: 'bfitAllocation',
                type: 'numeric',
                default: 0
            }),
            new TableColumn({
                name: 'bfitWinnerPot',
                type: 'numeric',
                default: 0
            })
        ])
        await queryRunner.addColumn('leaderboard_entry', new TableColumn({
            name: 'bfit_estimate',
            type: 'bigint',
            default: 0
        }))

        await queryRunner.query(`CREATE TABLE "league_waitlist_user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "league_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_f77f2d6d2f071304c55a1070117" PRIMARY KEY ("id"))`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('league', 'bfitAllocation')
        await queryRunner.dropColumn('league', 'bfitWinnerPot')
        await queryRunner.dropTable('league_waitlist_user')
    }

}

import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class leagueBfitEstimate1680465130163 implements MigrationInterface {
    name = 'leagueBfitEstimate1680465130163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('league')) {
            if (!await queryRunner.hasColumn('league', 'bfitAllocationEstimate')) {
                await queryRunner.addColumn(
                    'league',
                    new TableColumn({
                        name: 'bfitAllocationEstimate',
                        type: 'numeric',
                        default: 0
                    })
                )
            }
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('league', 'bfitAllocationEstimate')
    }

}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import {
  getDailyBfitTotal,
  leagueBfitPots
} from '../../src/helpers/bfit-helpers'

export class bfitallocation1679400650037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('league')) {
      if (!await queryRunner.hasColumn('league', 'bfitAllocation')) {
        await queryRunner.addColumn(
          'league',
          new TableColumn({
            name: 'bfitAllocation',
            type: 'numeric',
            default: 0
          })
        )
      }
      if (!await queryRunner.hasColumn('league', 'bfitWinnerPot')) {
        await queryRunner.addColumn(
          'league',
          new TableColumn({
            name: 'bfitWinnerPot',
            type: 'numeric',
            default: 0
          })
        )
      }
    }

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('league', 'bfitAllocation')
    await queryRunner.dropColumn('league', 'bfitWinnerPot')
  }
}

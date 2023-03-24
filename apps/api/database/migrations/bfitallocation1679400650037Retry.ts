import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class bfitallocation1679400650037Retry implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // we change if table exists in case we are running this migration on a fresh database
    if (await queryRunner.hasTable('league')) {

      if (await queryRunner.hasColumn('league', 'bfitAllocation')) {
        await queryRunner.dropColumn('league', 'bfitAllocation')
      }
      if (await queryRunner.hasColumn('league', 'bfitWinnerPot')) {
        await queryRunner.dropColumn('league', 'bfitWinnerPot')
      }
    }

    return queryRunner.addColumns('league', [
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('league', 'bfitAllocation')
    await queryRunner.dropColumn('league', 'bfitWinnerPot')
  }
}

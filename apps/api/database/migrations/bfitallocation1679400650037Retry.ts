import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class bfitallocation1679400650037Retry implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('league', 'bfitAllocation')) {
      await queryRunner.dropColumn('league', 'bfitAllocation')
    }

    if (await queryRunner.hasColumn('league', 'bfitWinnerPot')) {
      await queryRunner.dropColumn('league', 'bfitWinnerPot')
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('league', 'bfitAllocation')
    await queryRunner.dropColumn('league', 'bfitWinnerPot')
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class SimplifyGoalsDates1623703853664 implements MigrationInterface {
  name = 'SimplifyGoalsDates1623703853664'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals_entry" DROP COLUMN "year"`)
    await queryRunner.query(`ALTER TABLE "goals_entry" DROP COLUMN "day"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "day" integer NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "year" integer NOT NULL`
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class LeaguesStartEndDates1625649869427 implements MigrationInterface {
  name = 'LeaguesStartEndDates1625649869427'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" ADD "starts_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "ends_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "ends_at"`)
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "starts_at"`)
  }
}

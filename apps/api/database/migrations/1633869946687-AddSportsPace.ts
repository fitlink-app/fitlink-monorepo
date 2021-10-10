import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSportsPace1633869946687 implements MigrationInterface {
  name = 'AddSportsPace1633869946687'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sport" ADD "show_pace" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sport" DROP COLUMN "show_pace"`)
  }
}

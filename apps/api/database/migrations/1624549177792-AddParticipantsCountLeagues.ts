import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddParticipantsCountLeagues1624549177792
  implements MigrationInterface {
  name = 'AddParticipantsCountLeagues1624549177792'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" ADD "participants_total" integer NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" DROP COLUMN "participants_total"`
    )
  }
}

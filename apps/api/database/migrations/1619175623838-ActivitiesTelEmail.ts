import { MigrationInterface, QueryRunner } from 'typeorm'

export class ActivitiesTelEmail1619175623838 implements MigrationInterface {
  name = 'ActivitiesTelEmail1619175623838'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "organizer_telephone" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "organizer_email" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organizer_email"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organizer_telephone"`
    )
  }
}

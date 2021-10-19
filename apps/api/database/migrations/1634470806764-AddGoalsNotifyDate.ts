import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddGoalsNotifyDate1634470806764 implements MigrationInterface {
  name = 'AddGoalsNotifyDate1634470806764'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "notified_at" TIMESTAMP`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "notified_at"`
    )
  }
}

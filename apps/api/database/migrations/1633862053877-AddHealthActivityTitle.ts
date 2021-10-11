import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHealthActivityTitle1633862053877 implements MigrationInterface {
  name = 'AddHealthActivityTitle1633862053877'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD "title" character varying NOT NULL DEFAULT 'Activity'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "title"`)
  }
}

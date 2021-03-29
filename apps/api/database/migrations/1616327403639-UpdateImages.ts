import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateImages1616327403639 implements MigrationInterface {
  name = 'UpdateImages1616327403639'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "deleted_at"`)
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(Point)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(POINT,0)`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(`ALTER TABLE "image" ADD "deleted_at" TIMESTAMP`)
  }
}

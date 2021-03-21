import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateActivitiesAndImages1616321992927
  implements MigrationInterface {
  name = 'UpdateActivitiesAndImages1616321992927'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "url"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "keywords"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "archived"`)
    await queryRunner.query(`ALTER TABLE "image" ADD "deleted_at" TIMESTAMP`)
    await queryRunner.query(`ALTER TABLE "image" ADD "alt" character varying`)
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "name" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "cost" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "organizer_name" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "organizer_url" character varying`
    )
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
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organizer_url"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organizer_name"`
    )
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "cost"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "name"`)
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "alt"`)
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "deleted_at"`)
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "archived" boolean NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "keywords" json NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "url" character varying NOT NULL`
    )
  }
}

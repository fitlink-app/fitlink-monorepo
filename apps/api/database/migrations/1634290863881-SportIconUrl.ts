import { MigrationInterface, QueryRunner } from 'typeorm'

export class SportIconUrl1634290863881 implements MigrationInterface {
  name = 'SportIconUrl1634290863881'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sport" RENAME COLUMN "icon_svg" TO "icon_url"`
    )
    await queryRunner.query(`ALTER TABLE "sport" DROP COLUMN "icon_url"`)
    await queryRunner.query(
      `ALTER TABLE "sport" ADD "icon_url" character varying NOT NULL DEFAULT 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sport" DROP COLUMN "icon_url"`)
    await queryRunner.query(
      `ALTER TABLE "sport" ADD "icon_url" text NOT NULL DEFAULT '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#ffffff" fill-opacity="0"/></svg>'`
    )
    await queryRunner.query(
      `ALTER TABLE "sport" RENAME COLUMN "icon_url" TO "icon_svg"`
    )
  }
}

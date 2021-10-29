import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIconSvgToSport1634129894631 implements MigrationInterface {
  name = 'AddIconSvgToSport1634129894631'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sport" ADD "icon_svg" text NOT NULL DEFAULT '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#ffffff" fill-opacity="0"/></svg>'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sport" DROP COLUMN "icon_svg"`)
  }
}

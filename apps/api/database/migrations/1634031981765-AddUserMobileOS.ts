import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserMobileOS1634031981765 implements MigrationInterface {
  name = 'AddUserMobileOS1634031981765'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mobile_os" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobile_os"`)
  }
}

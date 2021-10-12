import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddImageUrlSport1633944959171 implements MigrationInterface {
  name = 'AddImageUrlSport1633944959171'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sport" ADD "image_url" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sport" DROP COLUMN "image_url"`)
  }
}

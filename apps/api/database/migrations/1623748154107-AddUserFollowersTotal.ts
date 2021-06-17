import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserFollowersTotal1623748154107 implements MigrationInterface {
  name = 'AddUserFollowersTotal1623748154107'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "followers_total" integer NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "followers_total"`)
  }
}

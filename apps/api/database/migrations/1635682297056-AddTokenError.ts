import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTokenError1635682297056 implements MigrationInterface {
  name = 'AddTokenError1635682297056'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "token_error" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "token_error"`)
  }
}

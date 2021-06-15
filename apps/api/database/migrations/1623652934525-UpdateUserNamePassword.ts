import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserNamePassword1623652934525 implements MigrationInterface {
  name = 'UpdateUserNamePassword1623652934525'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password_reset_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "user"."name" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "user"."name" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "password_reset_at"`
    )
  }
}

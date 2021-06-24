import { MigrationInterface, QueryRunner } from 'typeorm'

export class UserEmailPasswordResets1624400390377
  implements MigrationInterface {
  name = 'UserEmailPasswordResets1624400390377'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "email_reset_at" TIMESTAMP`)
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_verified" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_verified"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_reset_at"`)
  }
}

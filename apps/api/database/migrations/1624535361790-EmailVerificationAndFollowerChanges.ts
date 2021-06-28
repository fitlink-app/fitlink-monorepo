import { MigrationInterface, QueryRunner } from 'typeorm'

export class EmailVerificationAndFollowerChanges1624535361790
  implements MigrationInterface {
  name = 'EmailVerificationAndFollowerChanges1624535361790'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_reset_requested_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_pending" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD "following_total" integer NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "following_total"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_pending"`)
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "email_reset_requested_at"`
    )
  }
}

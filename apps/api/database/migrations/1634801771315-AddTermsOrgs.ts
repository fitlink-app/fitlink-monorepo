import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTermsOrgs1634801771315 implements MigrationInterface {
  name = 'AddTermsOrgs1634801771315'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "terms_agreed" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "terms_agreed_at" TIMESTAMP`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "terms_agreed_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "terms_agreed"`
    )
  }
}

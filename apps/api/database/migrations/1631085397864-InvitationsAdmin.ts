import { MigrationInterface, QueryRunner } from 'typeorm'

export class InvitationsAdmin1631085397864 implements MigrationInterface {
  name = 'InvitationsAdmin1631085397864'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD "admin" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD "admin" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP COLUMN "admin"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP COLUMN "admin"`
    )
  }
}

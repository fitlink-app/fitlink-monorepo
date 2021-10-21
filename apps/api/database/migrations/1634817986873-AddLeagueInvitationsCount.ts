import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLeagueInvitationsCount1634817986873
  implements MigrationInterface {
  name = 'AddLeagueInvitationsCount1634817986873'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "league_invitations_total" integer NOT NULL DEFAULT '0'`
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
      `ALTER TABLE "user" DROP COLUMN "league_invitations_total"`
    )
  }
}

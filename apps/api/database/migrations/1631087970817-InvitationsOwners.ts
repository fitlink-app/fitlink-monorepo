import { MigrationInterface, QueryRunner } from 'typeorm'

export class InvitationsOwners1631087970817 implements MigrationInterface {
  name = 'InvitationsOwners1631087970817'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD "ownerId" uuid`
    )
    await queryRunner.query(`ALTER TABLE "teams_invitation" ADD "ownerId" uuid`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "FK_dea35441ee8d3b6dc3590ea40ab" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_e43dc1db0f12b56fc96dca53676" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_e43dc1db0f12b56fc96dca53676"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "FK_dea35441ee8d3b6dc3590ea40ab"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP COLUMN "ownerId"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP COLUMN "ownerId"`
    )
  }
}

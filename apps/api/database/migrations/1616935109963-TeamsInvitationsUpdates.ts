import { MigrationInterface, QueryRunner } from 'typeorm'

export class TeamsInvitationsUpdates1616935109963
  implements MigrationInterface {
  name = 'TeamsInvitationsUpdates1616935109963'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD "email" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD "name" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_d1db5694bca43f0622512bc1856"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "teams_invitation"."resolvedUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "REL_d1db5694bca43f0622512bc185"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "teams_invitation"."teamId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "REL_4edd12c99766f39e83829c8f6c"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_d1db5694bca43f0622512bc1856" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_d1db5694bca43f0622512bc1856"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "REL_4edd12c99766f39e83829c8f6c" UNIQUE ("teamId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "teams_invitation"."teamId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "REL_d1db5694bca43f0622512bc185" UNIQUE ("resolvedUserId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "teams_invitation"."resolvedUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_d1db5694bca43f0622512bc1856" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`ALTER TABLE "teams_invitation" DROP COLUMN "name"`)
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP COLUMN "email"`
    )
  }
}

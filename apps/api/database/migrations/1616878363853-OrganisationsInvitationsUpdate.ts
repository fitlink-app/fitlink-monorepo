import { MigrationInterface, QueryRunner } from 'typeorm'

export class OrganisationsInvitationsUpdate1616878363853
  implements MigrationInterface {
  name = 'OrganisationsInvitationsUpdate1616878363853'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD "name" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "FK_544325c68461d0d338edb96712a"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "FK_d12d56b8716b3cb7845a5f555a4"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "organisations_invitation"."resolvedUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "REL_544325c68461d0d338edb96712"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "organisations_invitation"."organisationId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "REL_d12d56b8716b3cb7845a5f555a"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "FK_544325c68461d0d338edb96712a" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "FK_d12d56b8716b3cb7845a5f555a4" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "FK_d12d56b8716b3cb7845a5f555a4"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP CONSTRAINT "FK_544325c68461d0d338edb96712a"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "REL_d12d56b8716b3cb7845a5f555a" UNIQUE ("organisationId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "organisations_invitation"."organisationId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "REL_544325c68461d0d338edb96712" UNIQUE ("resolvedUserId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "organisations_invitation"."resolvedUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "FK_d12d56b8716b3cb7845a5f555a4" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" ADD CONSTRAINT "FK_544325c68461d0d338edb96712a" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisations_invitation" DROP COLUMN "name"`
    )
  }
}

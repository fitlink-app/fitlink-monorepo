import { MigrationInterface, QueryRunner } from 'typeorm'

export class OrganisationInvitationsAndSubscriptions1616424880465
  implements MigrationInterface {
  name = 'OrganisationInvitationsAndSubscriptions1616424880465'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63"`
    )
    await queryRunner.query(
      `CREATE TABLE "organisations_invitation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "dismissed" boolean NOT NULL DEFAULT false, "resolvedUserId" uuid, "organisationId" uuid, CONSTRAINT "REL_544325c68461d0d338edb96712" UNIQUE ("resolvedUserId"), CONSTRAINT "REL_d12d56b8716b3cb7845a5f555a" UNIQUE ("organisationId"), CONSTRAINT "PK_5117eac912e83337f1e1b322d10" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "REL_a141ea198d96dd0b959cc5c1a6"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "avatarLargeId"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_city" DROP NOT NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_city" IS NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(Point)`
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
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(POINT,0)`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."billing_city" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "billing_city" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "avatarLargeId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "REL_a141ea198d96dd0b959cc5c1a6" UNIQUE ("avatarLargeId")`
    )
    await queryRunner.query(`DROP TABLE "organisations_invitation"`)
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63" FOREIGN KEY ("avatarLargeId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

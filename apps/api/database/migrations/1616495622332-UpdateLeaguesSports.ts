import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateLeaguesSports1616495622332 implements MigrationInterface {
  name = 'UpdateLeaguesSports1616495622332'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "REL_a141ea198d96dd0b959cc5c1a6"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP COLUMN "avatarLargeId"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."sportId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "REL_333bcd11efd8b4f41161f3ad9a"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(Point)`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "meeting_point" TYPE geometry(POINT,0)`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "activity"."meeting_point" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "REL_333bcd11efd8b4f41161f3ad9a" UNIQUE ("sportId")`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."sportId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD "avatarLargeId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "REL_a141ea198d96dd0b959cc5c1a6" UNIQUE ("avatarLargeId")`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63" FOREIGN KEY ("avatarLargeId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

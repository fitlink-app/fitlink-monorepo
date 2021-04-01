import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTeamsUpdateLeagueSport1617030200766
  implements MigrationInterface {
  name = 'AddTeamsUpdateLeagueSport1617030200766'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "league" ADD "teamId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."sportId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "REL_333bcd11efd8b4f41161f3ad9a"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_3da00b392181a31a535cd91e09b" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_3da00b392181a31a535cd91e09b"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "REL_333bcd11efd8b4f41161f3ad9a" UNIQUE ("sportId")`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."sportId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "teamId"`)
  }
}

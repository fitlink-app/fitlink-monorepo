import { MigrationInterface, QueryRunner } from 'typeorm'

export class ActivitiesUpdates1617277086715 implements MigrationInterface {
  name = 'ActivitiesUpdates1617277086715'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "organizerImageId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "UQ_a61a9cc38bd407148d25a5be810" UNIQUE ("organizerImageId")`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."leagueId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "REL_b9d0d45d77e468323660b8fd6a"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_a61a9cc38bd407148d25a5be810" FOREIGN KEY ("organizerImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_a61a9cc38bd407148d25a5be810"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "REL_b9d0d45d77e468323660b8fd6a" UNIQUE ("leagueId")`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."leagueId" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "UQ_a61a9cc38bd407148d25a5be810"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organizerImageId"`
    )
  }
}

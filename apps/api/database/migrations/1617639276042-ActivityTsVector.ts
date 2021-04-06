import { MigrationInterface, QueryRunner } from 'typeorm'

export class ActivityTsVector1617639276042 implements MigrationInterface {
  name = 'ActivityTsVector1617639276042'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Manually added migration, TypeORM does not support GIN/creating triggers
    await queryRunner.query(`ALTER TABLE "activity" ADD "tsv" tsvector`)
    await queryRunner.query(
      `CREATE INDEX "activity_tsv_index" ON "activity" USING GIN(tsv)`
    )
    await queryRunner.query(
      `CREATE TRIGGER "activity_tsv_trigger" BEFORE INSERT OR UPDATE ON "activity" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(tsv, 'pg_catalog.english', name, description, date, organizer_name, meeting_point_text);`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Manually added migration, TypeORM does not support GIN/creating triggers
    await queryRunner.query(`DROP INDEX "activity_tsv_index"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "tsv"`)
    await queryRunner.query(`DROP TRIGGER "activity_tsv_trigger" ON "activity"`)
  }
}

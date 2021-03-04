import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitializeSchema1614887523112 implements MigrationInterface {
  name = 'InitializeSchema1614887523112'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "leaderboard_entry" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "leaderboard_entry_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leaderboard_id" character varying NOT NULL, "league_id" character varying NOT NULL, "user_id" character varying NOT NULL, "points" integer NOT NULL, "wins" integer NOT NULL, CONSTRAINT "PK_1a76e9207b9f19d1d02bdf45b58" PRIMARY KEY ("leaderboard_entry_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_03f6460d395d44b0c26e010478" ON "leaderboard_entry" ("points") `
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e60613e401d7320db8372d4cc3" ON "leaderboard_entry" ("leaderboard_id", "user_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_e60613e401d7320db8372d4cc3"`)
    await queryRunner.query(`DROP INDEX "IDX_03f6460d395d44b0c26e010478"`)
    await queryRunner.query(`DROP TABLE "leaderboard_entry"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateQueueable1618386283282 implements MigrationInterface {
  name = 'CreateQueueable1618386283282'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "queueable" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "process_after" TIMESTAMP NOT NULL, "payload" jsonb NOT NULL, "completed" boolean NOT NULL DEFAULT false, "errored" boolean NOT NULL DEFAULT false, "error" text, "worker" character varying NOT NULL DEFAULT 'default', CONSTRAINT "PK_851dd816048c35024e601ddfb5e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" DROP NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" SET NOT NULL`
    )
    await queryRunner.query(`DROP TABLE "queueable"`)
  }
}

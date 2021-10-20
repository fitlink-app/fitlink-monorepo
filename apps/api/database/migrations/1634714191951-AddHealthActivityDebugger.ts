import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHealthActivityDebugger1634714191951
  implements MigrationInterface {
  name = 'AddHealthActivityDebugger1634714191951'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "health_activity_debug" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "processed" json NOT NULL DEFAULT '{}', "raw" json NOT NULL DEFAULT '{}', "log" json NOT NULL DEFAULT '[]', "healthActivityId" uuid, "userId" uuid, CONSTRAINT "REL_9d5688a0d26e4c4e5e35055c13" UNIQUE ("healthActivityId"), CONSTRAINT "PK_19c327a2dad19a9de4e169e1203" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity_debug" ADD CONSTRAINT "FK_9d5688a0d26e4c4e5e35055c13b" FOREIGN KEY ("healthActivityId") REFERENCES "health_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity_debug" ADD CONSTRAINT "FK_83d96642797f13666bee225a4d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity_debug" DROP CONSTRAINT "FK_83d96642797f13666bee225a4d5"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity_debug" DROP CONSTRAINT "FK_9d5688a0d26e4c4e5e35055c13b"`
    )
    await queryRunner.query(`DROP TABLE "health_activity_debug"`)
  }
}

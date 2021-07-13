import { MigrationInterface, QueryRunner } from 'typeorm'

export class AuthProvider1625759364689 implements MigrationInterface {
  name = 'AuthProvider1625759364689'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_provider" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "raw_id" character varying, "display_name" character varying, "photo_url" character varying, "email" character varying, "userId" uuid, CONSTRAINT "PK_0a6e6348fe38ba49160eb903c95" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day')`
    )
    await queryRunner.query(
      `ALTER TABLE "auth_provider" ADD CONSTRAINT "FK_d9255ec09fddab3e47e84fd2a07" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_provider" DROP CONSTRAINT "FK_d9255ec09fddab3e47e84fd2a07"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ALTER COLUMN "ends_at" SET DEFAULT (CURRENT_TIMESTAMP + '1 day'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(`DROP TABLE "auth_provider"`)
  }
}

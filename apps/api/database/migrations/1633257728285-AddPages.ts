import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPages1633257728285 implements MigrationInterface {
  name = 'AddPages1633257728285'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "page" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain" character varying NOT NULL, "enabled" boolean NOT NULL, "banner" json NOT NULL, "content" json NOT NULL, "contact" json NOT NULL, "signup" json NOT NULL, "teamId" uuid, "logoId" uuid, CONSTRAINT "REL_b2207e935753b3a0efd8283773" UNIQUE ("teamId"), CONSTRAINT "REL_1f55571339c9683dde0eb66bdc" UNIQUE ("logoId"), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "page" ADD CONSTRAINT "FK_b2207e935753b3a0efd82837736" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "page" ADD CONSTRAINT "FK_1f55571339c9683dde0eb66bdc8" FOREIGN KEY ("logoId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "page" DROP CONSTRAINT "FK_1f55571339c9683dde0eb66bdc8"`
    )
    await queryRunner.query(
      `ALTER TABLE "page" DROP CONSTRAINT "FK_b2207e935753b3a0efd82837736"`
    )
    await queryRunner.query(`DROP TABLE "page"`)
  }
}

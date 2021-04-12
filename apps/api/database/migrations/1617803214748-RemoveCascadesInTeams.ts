import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveCascadesInTeams1617803214748 implements MigrationInterface {
  name = 'RemoveCascadesInTeams1617803214748'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" SET NOT NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "tsv" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}

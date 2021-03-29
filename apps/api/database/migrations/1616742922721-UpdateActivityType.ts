import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateActivityType1616742922721 implements MigrationInterface {
  name = 'UpdateActivityType1616742922721'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "activity_type_enum" AS ENUM('class', 'group', 'route')`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "type" "activity_type_enum" NOT NULL DEFAULT 'class'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "activity_type_enum"`)
  }
}

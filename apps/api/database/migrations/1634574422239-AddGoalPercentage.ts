import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddGoalPercentage1634574422239 implements MigrationInterface {
  name = 'AddGoalPercentage1634574422239'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "goal_percentage" double precision NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "goal_percentage"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateGoalTypes1623699931634 implements MigrationInterface {
  name = 'UpdateGoalTypes1623699931634'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "goal_calories" TO "goal_mindfulness_minutes"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "current_calories"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "target_calories"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "current_mindfulness_minutes" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "target_mindfulness_minutes" integer NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "target_mindfulness_minutes"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP COLUMN "current_mindfulness_minutes"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "target_calories" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD "current_calories" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "goal_mindfulness_minutes" TO "goal_calories"`
    )
  }
}

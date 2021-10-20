import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPushSuccessBoolean1634571990161 implements MigrationInterface {
  name = 'AddPushSuccessBoolean1634571990161'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "push_succeeded" boolean`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "push_succeeded"`
    )
  }
}

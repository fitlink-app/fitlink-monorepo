import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropForeignKeyConstraintsProvider1634852256096
  implements MigrationInterface {
  name = 'DropForeignKeyConstraintsProvider1634852256096'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_122dad8c29645869f138d44b7cd"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_122dad8c29645869f138d44b7cd" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

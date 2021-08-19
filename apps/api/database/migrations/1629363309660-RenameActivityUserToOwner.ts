import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameActivityUserToOwner1629363309660
  implements MigrationInterface {
  name = 'RenameActivityUserToOwner1629363309660'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" RENAME COLUMN "userId" TO "ownerId"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_2e32cff695a62ac42865ea087e2" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_2e32cff695a62ac42865ea087e2"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" RENAME COLUMN "ownerId" TO "userId"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

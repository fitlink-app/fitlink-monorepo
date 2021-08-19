import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrganisationToActivity1629305606334
  implements MigrationInterface {
  name = 'AddOrganisationToActivity1629305606334'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" ADD "organisationId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_0a013335a4f3f17e2f60388ed80" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_0a013335a4f3f17e2f60388ed80"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "organisationId"`
    )
  }
}

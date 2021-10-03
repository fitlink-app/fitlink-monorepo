import { MigrationInterface, QueryRunner } from 'typeorm'

export class DomainUnique1633275502651 implements MigrationInterface {
  name = 'DomainUnique1633275502651'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "page" ADD CONSTRAINT "UQ_628cdca6495049d92d3c342a4cd" UNIQUE ("domain")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "page" DROP CONSTRAINT "UQ_628cdca6495049d92d3c342a4cd"`
    )
  }
}

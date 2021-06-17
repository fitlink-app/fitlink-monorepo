import { MigrationInterface, QueryRunner } from 'typeorm'

export class ImagesAddOwner1623913230113 implements MigrationInterface {
  name = 'ImagesAddOwner1623913230113'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" ADD "ownerId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_132fcc8d44e719a21ac7a372c33" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_132fcc8d44e719a21ac7a372c33"`
    )
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "ownerId"`)
  }
}

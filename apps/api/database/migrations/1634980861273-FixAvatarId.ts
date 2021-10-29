import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixAvatarId1634980861273 implements MigrationInterface {
  name = 'FixAvatarId1634980861273'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ADD "avatarId" uuid`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "avatarId"`)
  }
}

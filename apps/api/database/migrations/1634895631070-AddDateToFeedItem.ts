import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDateToFeedItem1634895631070 implements MigrationInterface {
  name = 'AddDateToFeedItem1634895631070'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD "date" TIMESTAMP NOT NULL DEFAULT now()`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item" DROP COLUMN "date"`)
  }
}

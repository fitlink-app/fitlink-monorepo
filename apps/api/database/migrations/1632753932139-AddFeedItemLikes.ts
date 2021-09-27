import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFeedItemLikes1632753932139 implements MigrationInterface {
  name = 'AddFeedItemLikes1632753932139'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feed_item_like" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "feedItemId" uuid, CONSTRAINT "PK_c667675d9cbc62194dd17b974b3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "feed_item_likes_user" ("feedItemId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_e91d6a4c4c4fcab41c919a40c77" PRIMARY KEY ("feedItemId", "userId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1c5f4e502db47eff04a4024b2c" ON "feed_item_likes_user" ("feedItemId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3d399b5ffd66e4d5641fa4c86c" ON "feed_item_likes_user" ("userId") `
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "feed_item_like" ADD CONSTRAINT "FK_c7ac11a5194ec0dcdaac5187f81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_like" ADD CONSTRAINT "FK_37ec637cac90bea1095072e4d05" FOREIGN KEY ("feedItemId") REFERENCES "feed_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_likes_user" ADD CONSTRAINT "FK_1c5f4e502db47eff04a4024b2ce" FOREIGN KEY ("feedItemId") REFERENCES "feed_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_likes_user" ADD CONSTRAINT "FK_3d399b5ffd66e4d5641fa4c86c7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feed_item_likes_user" DROP CONSTRAINT "FK_3d399b5ffd66e4d5641fa4c86c7"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_likes_user" DROP CONSTRAINT "FK_1c5f4e502db47eff04a4024b2ce"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_like" DROP CONSTRAINT "FK_37ec637cac90bea1095072e4d05"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item_like" DROP CONSTRAINT "FK_c7ac11a5194ec0dcdaac5187f81"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`DROP INDEX "IDX_3d399b5ffd66e4d5641fa4c86c"`)
    await queryRunner.query(`DROP INDEX "IDX_1c5f4e502db47eff04a4024b2c"`)
    await queryRunner.query(`DROP TABLE "feed_item_likes_user"`)
    await queryRunner.query(`DROP TABLE "feed_item_like"`)
  }
}

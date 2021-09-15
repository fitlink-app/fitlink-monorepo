import { MigrationInterface, QueryRunner } from 'typeorm'

export class SubscriptionsInvitations1631698836263
  implements MigrationInterface {
  name = 'SubscriptionsInvitations1631698836263'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscriptions_invitation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying, "accepted" boolean NOT NULL DEFAULT false, "dismissed" boolean NOT NULL DEFAULT false, "ownerId" uuid, "resolvedUserId" uuid, "subscriptionId" uuid, CONSTRAINT "PK_1a8617252d7c10abe4f071b63d0" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" ADD CONSTRAINT "FK_f38578524b5d746dc22fc9c7c28" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" ADD CONSTRAINT "FK_5c609369cacef2d8d449ce7c1a0" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" ADD CONSTRAINT "FK_1f457370279a5930b1642d74b88" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" DROP CONSTRAINT "FK_1f457370279a5930b1642d74b88"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" DROP CONSTRAINT "FK_5c609369cacef2d8d449ce7c1a0"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscriptions_invitation" DROP CONSTRAINT "FK_f38578524b5d746dc22fc9c7c28"`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`DROP TABLE "subscriptions_invitation"`)
  }
}

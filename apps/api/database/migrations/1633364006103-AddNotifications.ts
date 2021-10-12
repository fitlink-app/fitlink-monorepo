import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotifications1633364006103 implements MigrationInterface {
  name = 'AddNotifications1633364006103'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "title" character varying NOT NULL, "subject" character varying NOT NULL, "subject_id" character varying, "meta_key" character varying, "meta_value" character varying, "seen" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD "unread_notifications" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "unread_notifications"`
    )
    await queryRunner.query(`DROP TABLE "notification"`)
  }
}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UserTiersUpdateAddedNullable1629720807536 implements MigrationInterface {
    name = 'UserTiersUpdateAddedNullable1629720807536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "week_rest_at" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."week_rest_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user"."week_rest_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "week_rest_at" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
    }

}

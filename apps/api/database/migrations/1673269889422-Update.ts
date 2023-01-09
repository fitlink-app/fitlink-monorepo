import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1673269889422 implements MigrationInterface {
    name = 'Update1673269889422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "league" ADD "bfit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bfit_balance" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_949787f1a267a649071dc53834" ON "leaderboard_entry" ("bfit") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_949787f1a267a649071dc53834"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bfit_balance"`);
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "bfit"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit"`);
    }

}

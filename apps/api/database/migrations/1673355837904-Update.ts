import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1673355837904 implements MigrationInterface {
    name = 'Update1673355837904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_949787f1a267a649071dc53834"`);
        await queryRunner.query(`CREATE TABLE "league_bfit_claim" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "league_id" character varying NOT NULL, "user_id" character varying NOT NULL, "bfit_amount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f89a557a1ff12be5fefce691aba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e88be5bfc58fe56c6caffc071" ON "league_bfit_claim" ("bfit_amount") `);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_earned" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_claimed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_1c4377259edabe4e2aa4bc6db4" ON "leaderboard_entry" ("bfit_earned") `);
        await queryRunner.query(`CREATE INDEX "IDX_697a21ba4580b9a3471f2d949c" ON "leaderboard_entry" ("bfit_claimed") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_697a21ba4580b9a3471f2d949c"`);
        await queryRunner.query(`DROP INDEX "IDX_1c4377259edabe4e2aa4bc6db4"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_claimed"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_earned"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX "IDX_8e88be5bfc58fe56c6caffc071"`);
        await queryRunner.query(`DROP TABLE "league_bfit_claim"`);
        await queryRunner.query(`CREATE INDEX "IDX_949787f1a267a649071dc53834" ON "leaderboard_entry" ("bfit") `);
    }

}

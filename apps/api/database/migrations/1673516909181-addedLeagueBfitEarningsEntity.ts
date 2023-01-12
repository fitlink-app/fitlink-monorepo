import {MigrationInterface, QueryRunner} from "typeorm";

export class addedLeagueBfitEarningsEntity1673516909181 implements MigrationInterface {
    name = 'addedLeagueBfitEarningsEntity1673516909181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "league_bfit_earnings" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "league_id" character varying NOT NULL, "user_id" character varying NOT NULL, "bfit_amount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_7c23e03fc51060c505728fd972b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_988e65508cf3bd3aaa836302e5" ON "league_bfit_earnings" ("bfit_amount") `);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`DROP INDEX "IDX_988e65508cf3bd3aaa836302e5"`);
        await queryRunner.query(`DROP TABLE "league_bfit_earnings"`);
    }

}

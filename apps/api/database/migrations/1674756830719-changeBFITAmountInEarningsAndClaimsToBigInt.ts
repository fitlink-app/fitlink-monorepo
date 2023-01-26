import {MigrationInterface, QueryRunner} from "typeorm";

export class changeBFITAmountInEarningsAndClaimsToBigInt1674756830719 implements MigrationInterface {
    name = 'changeBFITAmountInEarningsAndClaimsToBigInt1674756830719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8e88be5bfc58fe56c6caffc071"`);
        await queryRunner.query(`DROP INDEX "IDX_988e65508cf3bd3aaa836302e5"`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "league_bfit_claim" DROP COLUMN "bfit_amount"`);
        await queryRunner.query(`ALTER TABLE "league_bfit_claim" ADD "bfit_amount" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "league_bfit_earnings" DROP COLUMN "bfit_amount"`);
        await queryRunner.query(`ALTER TABLE "league_bfit_earnings" ADD "bfit_amount" bigint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "league_bfit_earnings" DROP COLUMN "bfit_amount"`);
        await queryRunner.query(`ALTER TABLE "league_bfit_earnings" ADD "bfit_amount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "league_bfit_claim" DROP COLUMN "bfit_amount"`);
        await queryRunner.query(`ALTER TABLE "league_bfit_claim" ADD "bfit_amount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_988e65508cf3bd3aaa836302e5" ON "league_bfit_earnings" ("bfit_amount") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e88be5bfc58fe56c6caffc071" ON "league_bfit_claim" ("bfit_amount") `);
    }

}

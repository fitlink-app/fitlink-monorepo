import {MigrationInterface, QueryRunner} from "typeorm";

export class changeRewardBFITRequiredToBigInt1674725966038 implements MigrationInterface {
    name = 'changeRewardBFITRequiredToBigInt1674725966038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "bfit_required"`);
        await queryRunner.query(`ALTER TABLE "reward" ADD "bfit_required" bigint`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "bfit_required"`);
        await queryRunner.query(`ALTER TABLE "reward" ADD "bfit_required" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
    }

}

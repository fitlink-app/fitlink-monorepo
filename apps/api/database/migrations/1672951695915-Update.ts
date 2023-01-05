import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1672951695915 implements MigrationInterface {
    name = 'Update1672951695915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "reward_redeem_type_enum" AS ENUM('points', 'bfit')`);
        await queryRunner.query(`ALTER TABLE "reward" ADD "redeem_type" "reward_redeem_type_enum" NOT NULL DEFAULT 'points'`);
        await queryRunner.query(`ALTER TABLE "reward" ADD "bfit_required" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reward" ALTER COLUMN "points_required" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "reward"."points_required" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "reward"."points_required" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reward" ALTER COLUMN "points_required" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "bfit_required"`);
        await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "redeem_type"`);
        await queryRunner.query(`DROP TYPE "reward_redeem_type_enum"`);
    }

}

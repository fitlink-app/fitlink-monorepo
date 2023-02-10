import {MigrationInterface, QueryRunner} from "typeorm";

export class changeUserBfitBalanceToBigInt1674579033783 implements MigrationInterface {
    name = 'changeUserBfitBalanceToBigInt1674579033783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bfit_balance"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bfit_balance" bigint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bfit_balance"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bfit_balance" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1675854302597 implements MigrationInterface {
    name = 'Update1675854302597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD "transaction_id" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "wallet_transaction"."user_id" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "wallet_transaction"."user_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP COLUMN "transaction_id"`);
    }

}

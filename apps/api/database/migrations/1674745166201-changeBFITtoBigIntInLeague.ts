import {MigrationInterface, QueryRunner} from "typeorm";

export class changeBFITtoBigIntInLeague1674745166201 implements MigrationInterface {
    name = 'changeBFITtoBigIntInLeague1674745166201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "bfit"`);
        await queryRunner.query(`ALTER TABLE "league" ADD "bfit" bigint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "bfit"`);
        await queryRunner.query(`ALTER TABLE "league" ADD "bfit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
    }

}

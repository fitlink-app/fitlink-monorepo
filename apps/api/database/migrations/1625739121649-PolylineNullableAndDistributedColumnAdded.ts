import {MigrationInterface, QueryRunner} from "typeorm";

export class PolylineNullableAndDistributedColumnAdded1625739121649 implements MigrationInterface {
    name = 'PolylineNullableAndDistributedColumnAdded1625739121649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "distributed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "ends_at" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day')`);
        await queryRunner.query(`ALTER TABLE "health_activity" ALTER COLUMN "polyline" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."polyline" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."polyline" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ALTER COLUMN "polyline" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "ends_at" SET DEFAULT (CURRENT_TIMESTAMP + '1 day'`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."ends_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "distributed"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class changeBFITClaimedToBigInt1674744806302 implements MigrationInterface {
    name = 'changeBFITClaimedToBigInt1674744806302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_697a21ba4580b9a3471f2d949c"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_claimed"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_claimed" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "bfit_claimed"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "bfit_claimed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX "IDX_697a21ba4580b9a3471f2d949c" ON "leaderboard_entry" ("bfit_claimed") `);
    }

}

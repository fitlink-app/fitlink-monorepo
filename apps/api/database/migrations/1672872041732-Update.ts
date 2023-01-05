import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1672872041732 implements MigrationInterface {
    name = 'Update1672872041732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TYPE "public"."league_access_enum" RENAME TO "league_access_enum_old"`);
        await queryRunner.query(`CREATE TYPE "league_access_enum" AS ENUM('private', 'public', 'team', 'organisation', 'competetoearn')`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" TYPE "league_access_enum" USING "access"::"text"::"league_access_enum"`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" SET DEFAULT 'private'`);
        await queryRunner.query(`DROP TYPE "league_access_enum_old"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."access" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "league"."access" IS NULL`);
        await queryRunner.query(`CREATE TYPE "league_access_enum_old" AS ENUM('private', 'public', 'team', 'organisation')`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" TYPE "league_access_enum_old" USING "access"::"text"::"league_access_enum_old"`);
        await queryRunner.query(`ALTER TABLE "league" ALTER COLUMN "access" SET DEFAULT 'private'`);
        await queryRunner.query(`DROP TYPE "league_access_enum"`);
        await queryRunner.query(`ALTER TYPE "league_access_enum_old" RENAME TO  "league_access_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
    }

}

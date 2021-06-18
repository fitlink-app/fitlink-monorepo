import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateHealthActivityAndImageEntity1623144653510 implements MigrationInterface {
    name = 'UpdateHealthActivityAndImageEntity1623144653510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "FK_00b4b8b25ccecde64c38331fbad"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "start_at"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "end_at"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "REL_00b4b8b25ccecde64c38331fba"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "imageId"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "start_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "end_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "active_time" integer`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "distance" integer`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "quantity" integer`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "stairs" integer`);
        await queryRunner.query(`ALTER TABLE "image" ADD "healthActivityId" uuid`);
        await queryRunner.query(`ALTER TABLE "health_activity" ALTER COLUMN "elevation" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."elevation" IS NULL`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_32335bbb5b6e5dc08e35c2f6e0d" FOREIGN KEY ("healthActivityId") REFERENCES "health_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_32335bbb5b6e5dc08e35c2f6e0d"`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."elevation" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ALTER COLUMN "elevation" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "healthActivityId"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "stairs"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "active_time"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "end_time"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "start_time"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "imageId" uuid`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "REL_00b4b8b25ccecde64c38331fba" UNIQUE ("imageId")`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "end_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "start_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "FK_00b4b8b25ccecde64c38331fbad" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

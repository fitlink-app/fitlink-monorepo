import {MigrationInterface, QueryRunner} from "typeorm";

export class CaloriesTypeFloat1623220634432 implements MigrationInterface {
    name = 'CaloriesTypeFloat1623220634432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "calories"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "calories" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "distance" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "distance" integer`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "calories"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "calories" integer NOT NULL`);
    }

}

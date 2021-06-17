import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedPolylineToHealthActivities1623922917753 implements MigrationInterface {
    name = 'AddedPolylineToHealthActivities1623922917753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" ADD "polyline" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP COLUMN "polyline"`);
    }

}

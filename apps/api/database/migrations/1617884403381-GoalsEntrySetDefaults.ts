import {MigrationInterface, QueryRunner} from "typeorm";

export class GoalsEntrySetDefaults1617884403381 implements MigrationInterface {
    name = 'GoalsEntrySetDefaults1617884403381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."year" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "year" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."day" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "day" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_calories" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_calories" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_calories" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_calories" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_calories" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_steps" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_steps" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_steps" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_steps" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_steps" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_floors_climbed" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_floors_climbed" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_floors_climbed" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_floors_climbed" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_floors_climbed" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_water_litres" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_water_litres" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_water_litres" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_water_litres" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_water_litres" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_water_litres" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_sleep_hours" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_sleep_hours" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_sleep_hours" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_sleep_hours" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_sleep_hours" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_sleep_hours" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "activity" ALTER COLUMN "tsv" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "activity"."tsv" IS NULL`);
        await queryRunner.query(`ALTER TABLE "activity" ALTER COLUMN "tsv" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_sleep_hours" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_sleep_hours" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_sleep_hours" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_sleep_hours" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_sleep_hours" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_sleep_hours" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_water_litres" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_water_litres" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_water_litres" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_water_litres" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_water_litres" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_water_litres" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_floors_climbed" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_floors_climbed" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_floors_climbed" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_floors_climbed" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_floors_climbed" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_steps" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_steps" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_steps" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_steps" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_steps" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_calories" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."target_calories" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "target_calories" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "current_calories" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."current_calories" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "day" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."day" IS NULL`);
        await queryRunner.query(`ALTER TABLE "goals_entry" ALTER COLUMN "year" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "goals_entry"."year" IS NULL`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpatedProviderRelationshipAndSportRelationShip1623225545622 implements MigrationInterface {
    name = 'UpatedProviderRelationshipAndSportRelationShip1623225545622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "FK_538c1b09794a6d0db076a47e701"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "FK_122dad8c29645869f138d44b7cd"`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."sportId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "REL_538c1b09794a6d0db076a47e70"`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."providerId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "REL_122dad8c29645869f138d44b7c"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "FK_538c1b09794a6d0db076a47e701" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "FK_122dad8c29645869f138d44b7cd" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "FK_122dad8c29645869f138d44b7cd"`);
        await queryRunner.query(`ALTER TABLE "health_activity" DROP CONSTRAINT "FK_538c1b09794a6d0db076a47e701"`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "REL_122dad8c29645869f138d44b7c" UNIQUE ("providerId")`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."providerId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "REL_538c1b09794a6d0db076a47e70" UNIQUE ("sportId")`);
        await queryRunner.query(`COMMENT ON COLUMN "health_activity"."sportId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "FK_122dad8c29645869f138d44b7cd" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health_activity" ADD CONSTRAINT "FK_538c1b09794a6d0db076a47e701" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

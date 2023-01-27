import {MigrationInterface, QueryRunner} from "typeorm";

export class addedWalletTransactionsEntity1674817445470 implements MigrationInterface {
    name = 'addedWalletTransactionsEntity1674817445470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "wallet_transaction_source_enum" AS ENUM('reward_redemption', 'league_bfit_claim', 'league_bfit_earnings')`);
        await queryRunner.query(`CREATE TABLE "wallet_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source" "wallet_transaction_source_enum" NOT NULL DEFAULT 'league_bfit_earnings', "bfit_amount" bigint NOT NULL DEFAULT '0', "earningsId" uuid, "claimId" uuid, "rewardRedemptionId" uuid, "leagueId" uuid, "userId" uuid, CONSTRAINT "REL_52d3d20a08c449f9362aac851f" UNIQUE ("earningsId"), CONSTRAINT "REL_9e2d2b9e0c8ea2b842d0c05c62" UNIQUE ("claimId"), CONSTRAINT "REL_26fb4db916c1f56c58f650bba3" UNIQUE ("rewardRedemptionId"), CONSTRAINT "REL_46bb751930381436a2a0714395" UNIQUE ("leagueId"), CONSTRAINT "REL_9071d3c9266c4521bdafe29307" UNIQUE ("userId"), CONSTRAINT "PK_62a01b9c3a734b96a08c621b371" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_52d3d20a08c449f9362aac851f2" FOREIGN KEY ("earningsId") REFERENCES "league_bfit_earnings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_9e2d2b9e0c8ea2b842d0c05c622" FOREIGN KEY ("claimId") REFERENCES "league_bfit_claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_26fb4db916c1f56c58f650bba33" FOREIGN KEY ("rewardRedemptionId") REFERENCES "rewards_redemption"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_46bb751930381436a2a0714395e" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_9071d3c9266c4521bdafe29307a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_9071d3c9266c4521bdafe29307a"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_46bb751930381436a2a0714395e"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_26fb4db916c1f56c58f650bba33"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_9e2d2b9e0c8ea2b842d0c05c622"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_52d3d20a08c449f9362aac851f2"`);
        await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`);
        await queryRunner.query(`DROP TABLE "wallet_transaction"`);
        await queryRunner.query(`DROP TYPE "wallet_transaction_source_enum"`);
    }

}

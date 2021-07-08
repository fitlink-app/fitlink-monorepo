import { MigrationInterface, QueryRunner } from 'typeorm'

export class RewardsRedemptionsUpdates1625572472206
  implements MigrationInterface {
  name = 'RewardsRedemptionsUpdates1625572472206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "rewards_redemption"."userId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "REL_35341dc6a3bc6a9ff33b40dfff"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "rewards_redemption"."rewardId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "REL_758ebc8a1022731cb6ae4f50a0"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "REL_758ebc8a1022731cb6ae4f50a0" UNIQUE ("rewardId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "rewards_redemption"."rewardId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "REL_35341dc6a3bc6a9ff33b40dfff" UNIQUE ("userId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "rewards_redemption"."userId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeProviderNullableOnHealthEntity1634852801058
  implements MigrationInterface {
  name = 'MakeProviderNullableOnHealthEntity1634852801058'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
  }
}

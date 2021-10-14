import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixEnums1629302813084 implements MigrationInterface {
  name = 'FixEnums1629302813084'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_status"`
    )
    await queryRunner.query(
      `CREATE TYPE "subscription_billing_plan_status_enum" AS ENUM('active', 'canceled')`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_status" "subscription_billing_plan_status_enum"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "platform"`)
    await queryRunner.query(
      `CREATE TYPE "reward_platform_enum" AS ENUM('fitlink')`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "platform" "reward_platform_enum" NOT NULL DEFAULT 'fitlink'`
    )
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "access"`)
    await queryRunner.query(
      `CREATE TYPE "reward_access_enum" AS ENUM('public', 'team', 'organisation')`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "access" "reward_access_enum" NOT NULL DEFAULT 'public'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "access"`)
    await queryRunner.query(
      `CREATE TYPE "league_access_enum" AS ENUM('private', 'public', 'team', 'organisation')`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "access" "league_access_enum" NOT NULL DEFAULT 'private'`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP COLUMN "invite_permission"`
    )
    await queryRunner.query(
      `CREATE TYPE "league_invite_permission_enum" AS ENUM('owner', 'participant')`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "invite_permission" "league_invite_permission_enum" NOT NULL DEFAULT 'participant'`
    )
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "role"`)
    await queryRunner.query(
      `CREATE TYPE "user_role_role_enum" AS ENUM('organisation_admin', 'subscription_admin', 'team_admin', 'super_admin', 'self')`
    )
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "role" "user_role_role_enum" NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "auth_provider" DROP COLUMN "type"`)
    await queryRunner.query(
      `CREATE TYPE "auth_provider_type_enum" AS ENUM('google.com', 'apple.com')`
    )
    await queryRunner.query(
      `ALTER TABLE "auth_provider" ADD "type" "auth_provider_type_enum" NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rank"`)
    await queryRunner.query(
      `CREATE TYPE "user_rank_enum" AS ENUM('Fitlink Newbie')`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD "rank" "user_rank_enum" NOT NULL DEFAULT 'Fitlink Newbie'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rank"`)
    await queryRunner.query(`DROP TYPE "user_rank_enum"`)
    await queryRunner.query(
      `ALTER TABLE "user" ADD "rank" character varying NOT NULL DEFAULT 'Fitlink Newbie'`
    )
    await queryRunner.query(`ALTER TABLE "auth_provider" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "auth_provider_type_enum"`)
    await queryRunner.query(
      `ALTER TABLE "auth_provider" ADD "type" character varying NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "role"`)
    await queryRunner.query(`DROP TYPE "user_role_role_enum"`)
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "role" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP COLUMN "invite_permission"`
    )
    await queryRunner.query(`DROP TYPE "league_invite_permission_enum"`)
    await queryRunner.query(
      `ALTER TABLE "league" ADD "invite_permission" character varying NOT NULL DEFAULT 'participant'`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "access"`)
    await queryRunner.query(`DROP TYPE "league_access_enum"`)
    await queryRunner.query(
      `ALTER TABLE "league" ADD "access" character varying NOT NULL DEFAULT 'private'`
    )
    await queryRunner.query(`COMMENT ON COLUMN "league"."starts_at" IS NULL`)
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "access"`)
    await queryRunner.query(`DROP TYPE "reward_access_enum"`)
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "access" character varying NOT NULL DEFAULT 'public'`
    )
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "platform"`)
    await queryRunner.query(`DROP TYPE "reward_platform_enum"`)
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "platform" character varying NOT NULL DEFAULT 'fitlink'`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "subscription"."subscription_starts_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "billing_plan_status"`
    )
    await queryRunner.query(`DROP TYPE "subscription_billing_plan_status_enum"`)
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "billing_plan_status" character varying`
    )
  }
}

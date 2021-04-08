import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitializeSchema1615794470267 implements MigrationInterface {
  name = 'InitializeSchema1615794470267'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_e60613e401d7320db8372d4cc3"`)
    await queryRunner.query(
      `CREATE TYPE "image_type_enum" AS ENUM('avatar', 'cover')`
    )
    await queryRunner.query(
      `CREATE TABLE "image" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "raw_url" character varying NOT NULL, "url" character varying NOT NULL, "url_128x128" character varying NOT NULL, "url_512x512" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "original_width" integer NOT NULL, "original_height" integer NOT NULL, "type" "image_type_enum" NOT NULL, "activityId" uuid, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "organisation_type_enum" AS ENUM('company', 'government', 'school', 'institution', 'other')`
    )
    await queryRunner.query(
      `CREATE TABLE "organisation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "billing_address_1" character varying, "billing_address_2" character varying, "billing_country" character varying, "billing_country_code" character varying, "billing_state" character varying, "billing_city" character varying NOT NULL, "type" "organisation_type_enum" NOT NULL DEFAULT 'company', "type_other" character varying, "timezone" character varying NOT NULL DEFAULT 'Etc/UTC', "user_count" integer NOT NULL DEFAULT '0', "avatarId" uuid, "avatarLargeId" uuid, CONSTRAINT "REL_fa7be9232bedf81dade53d50bd" UNIQUE ("avatarId"), CONSTRAINT "REL_a141ea198d96dd0b959cc5c1a6" UNIQUE ("avatarLargeId"), CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "leaderboard" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leagueId" uuid, CONSTRAINT "PK_76fd1d52cf44d209920f73f4608" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "sport" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "name_key" character varying NOT NULL, "singular" character varying NOT NULL, "plural" character varying NOT NULL, CONSTRAINT "UQ_6a16e1d83cb581484036cee92bf" UNIQUE ("name"), CONSTRAINT "UQ_3a414486e95fd10b8133691e1f1" UNIQUE ("name_key"), CONSTRAINT "PK_c67275331afac347120a1032825" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "league" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "sportId" uuid, "activeLeaderboardId" uuid, CONSTRAINT "REL_333bcd11efd8b4f41161f3ad9a" UNIQUE ("sportId"), CONSTRAINT "REL_5cd1b613fa6fd1db28b5a78f7b" UNIQUE ("activeLeaderboardId"), CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "provider_type_enum" AS ENUM('strava', 'fitbit', 'google_fit', 'apple_healthkit')`
    )
    await queryRunner.query(
      `CREATE TABLE "provider" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "provider_type_enum" NOT NULL, "refresh_token" character varying NOT NULL, "token" character varying NOT NULL, "token_expires_at" TIMESTAMP NOT NULL, "scopes" json NOT NULL, "provider_user_id" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_6ab2f66d8987bf1bfdd6136a2d5" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_daily_statistics_enum" AS ENUM('private', 'followers', 'public')`
    )
    await queryRunner.query(
      `CREATE TYPE "users_setting_privacy_activities_enum" AS ENUM('private', 'followers', 'public')`
    )
    await queryRunner.query(
      `CREATE TABLE "users_setting" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "newsletter_subscriptions_user" boolean NOT NULL DEFAULT false, "newsletter_subscriptions_admin" boolean NOT NULL DEFAULT false, "privacy_daily_statistics" "users_setting_privacy_daily_statistics_enum" NOT NULL, "privacy_activities" "users_setting_privacy_activities_enum" NOT NULL, CONSTRAINT "PK_375f66467f11d02f15c3ebf4ece" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "following" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followerId" uuid, "followingId" uuid, CONSTRAINT "PK_c76c6e044bdf76ecf8bfb82a645" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "goals_entry" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "year" integer NOT NULL DEFAULT '0', "day" integer NOT NULL DEFAULT '0', "current_calories" integer DEFAULT '0', "target_calories" integer DEFAULT '0', "current_steps" integer DEFAULT '0', "target_steps" integer DEFAULT '0', "current_floors_climbed" integer DEFAULT '0', "target_floors_climbed" integer DEFAULT '0', "current_water_litres" double precision DEFAULT '0', "target_water_litres" double precision DEFAULT '0', "current_sleep_hours" double precision DEFAULT '0', "target_sleep_hours" double precision DEFAULT '0', "userId" uuid, CONSTRAINT "PK_5e3a6bf258a670328d86f293917" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "health_activity" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "points" integer NOT NULL, "calories" integer NOT NULL, "elevation" double precision NOT NULL, "start_at" TIMESTAMP NOT NULL, "end_at" TIMESTAMP NOT NULL, "userId" uuid, "imageId" uuid, "sportId" uuid, "providerId" uuid, CONSTRAINT "REL_00b4b8b25ccecde64c38331fba" UNIQUE ("imageId"), CONSTRAINT "REL_538c1b09794a6d0db076a47e70" UNIQUE ("sportId"), CONSTRAINT "REL_122dad8c29645869f138d44b7c" UNIQUE ("providerId"), CONSTRAINT "PK_808c0bc06cf2d83915c55d684a4" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_event_enum" AS ENUM('health_activity', 'new_follower', 'user_goal', 'won_league', 'joined_league', 'goal_hit', 'lifestyle_activity', 'reward_claimed')`
    )
    await queryRunner.query(
      `CREATE TYPE "feed_item_group_enum" AS ENUM('user_activity', 'user_goal')`
    )
    await queryRunner.query(
      `CREATE TABLE "feed_item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event" "feed_item_event_enum" NOT NULL, "group" "feed_item_group_enum" NOT NULL, "userId" uuid, "imageId" uuid, "relatedUserId" uuid, "relatedHealthActivityId" uuid, "relatedGoalsEntryId" uuid, CONSTRAINT "REL_f8116b854f18829d8227971199" UNIQUE ("imageId"), CONSTRAINT "REL_7c7f5a4626dd76413d55c33da4" UNIQUE ("relatedUserId"), CONSTRAINT "REL_2c0c26f18495c64ed1ebdeb41d" UNIQUE ("relatedHealthActivityId"), CONSTRAINT "REL_89b8906d1f1e378646460b23f7" UNIQUE ("relatedGoalsEntryId"), CONSTRAINT "PK_15e831e9beea6ca204556c64438" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "revoked_at" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "user_unit_system_enum" AS ENUM('metric', 'imperial')`
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "password" character varying NOT NULL, "unit_system" "user_unit_system_enum" NOT NULL DEFAULT 'metric', "onboarded" boolean NOT NULL DEFAULT false, "last_onboarded_at" TIMESTAMP, "timezone" character varying NOT NULL DEFAULT 'Etc/UTC', "last_login_at" TIMESTAMP, "last_app_opened_at" TIMESTAMP, "last_health_activity_at" TIMESTAMP, "last_lifestyle_activity_at" TIMESTAMP, "name" character varying NOT NULL, "email" character varying NOT NULL, "rank" character varying NOT NULL DEFAULT 'Fitlink Newbie', "points_total" integer NOT NULL DEFAULT '0', "points_week" integer NOT NULL DEFAULT '0', "goal_calories" integer NOT NULL DEFAULT '0', "goal_steps" integer NOT NULL DEFAULT '0', "goal_floors_climbed" integer NOT NULL DEFAULT '0', "goal_water_litres" double precision NOT NULL DEFAULT '0', "goal_sleep_hours" double precision NOT NULL DEFAULT '0', "avatarId" uuid, "settingsId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_58f5c71eaab331645112cf8cfa" UNIQUE ("avatarId"), CONSTRAINT "REL_390395c3d8592e3e8d8422ce85" UNIQUE ("settingsId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "rewards_redemption" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "rewardId" uuid, CONSTRAINT "REL_35341dc6a3bc6a9ff33b40dfff" UNIQUE ("userId"), CONSTRAINT "REL_758ebc8a1022731cb6ae4f50a0" UNIQUE ("rewardId"), CONSTRAINT "PK_90e860ac3da19f252698c6f9247" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "reward" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "name" character varying NOT NULL, "name_short" character varying NOT NULL, "code" character varying NOT NULL, "redeem_url" character varying NOT NULL, "brand" character varying NOT NULL, "points_required" integer NOT NULL, "redeemed_count" integer NOT NULL, "reward_expires_at" TIMESTAMP NOT NULL, "public" boolean NOT NULL, "teamId" uuid, "imageId" uuid, CONSTRAINT "REL_d83c66a1cf262655809d110773" UNIQUE ("imageId"), CONSTRAINT "PK_a90ea606c229e380fb341838036" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "team" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "organisationId" uuid, "avatarId" uuid, CONSTRAINT "REL_e9780bcaf4dc375f939fe904f6" UNIQUE ("avatarId"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "activity" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "date" character varying NOT NULL, "keywords" json NOT NULL, "description" character varying NOT NULL, "meeting_point" geometry(Point) NOT NULL, "meeting_point_text" character varying NOT NULL, "archived" boolean NOT NULL, "leagueId" uuid, "teamId" uuid, CONSTRAINT "REL_b9d0d45d77e468323660b8fd6a" UNIQUE ("leagueId"), CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "leagues_invitation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accepted" boolean NOT NULL DEFAULT false, "dismissed" boolean NOT NULL DEFAULT false, "toUserId" uuid, "fromUserId" uuid, "fromPhotoId" uuid, "teamId" uuid, "leagueId" uuid, CONSTRAINT "REL_d06901d7d8ddd16428e78f6b66" UNIQUE ("toUserId"), CONSTRAINT "REL_c7f6673e26cce517c07f696fe4" UNIQUE ("fromUserId"), CONSTRAINT "REL_41f1c0d60f9febd68796b80a63" UNIQUE ("fromPhotoId"), CONSTRAINT "REL_4d839876775b00a4a45252c76e" UNIQUE ("teamId"), CONSTRAINT "REL_f502cb50a88813f9805bd60b60" UNIQUE ("leagueId"), CONSTRAINT "PK_f9ff48359bf3c5dd52505e493d3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "teams_invitation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accepted" boolean NOT NULL DEFAULT false, "dismissed" boolean NOT NULL DEFAULT false, "resolvedUserId" uuid, "teamId" uuid, CONSTRAINT "REL_d1db5694bca43f0622512bc185" UNIQUE ("resolvedUserId"), CONSTRAINT "REL_4edd12c99766f39e83829c8f6c" UNIQUE ("teamId"), CONSTRAINT "PK_750686ba5a232d13ad7f76066e9" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "league_users_user" ("leagueId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_28ca99dbf3a4606b9dfc30293a8" PRIMARY KEY ("leagueId", "userId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e0d5b66fcf0fea207425e3a36e" ON "league_users_user" ("leagueId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_26f74c894928a31deb68f514e0" ON "league_users_user" ("userId") `
    )
    await queryRunner.query(
      `CREATE TABLE "team_users_user" ("teamId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_b15f37b0ce77b1f0bb3e5b98633" PRIMARY KEY ("teamId", "userId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e51365666f6e400fe5f85d709a" ON "team_users_user" ("teamId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3645709c5fc6fa1178ebe7f7b9" ON "team_users_user" ("userId") `
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "PK_1a76e9207b9f19d1d02bdf45b58"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP COLUMN "leaderboard_entry_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "PK_1fc8b5e6ca39eef72154ff25654" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD "leaderboardId" uuid`
    )
    await queryRunner.query(`ALTER TABLE "leaderboard_entry" ADD "userId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_21b660ac3034e8cd7e2f343a9c4" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_fa7be9232bedf81dade53d50bd2" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" ADD CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63" FOREIGN KEY ("avatarLargeId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "FK_747dfc8de16228a2d005c2e1d66" FOREIGN KEY ("leaderboardId") REFERENCES "leaderboard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "FK_8f67aa13411be7845fa46826e43" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard" ADD CONSTRAINT "FK_e6a53f49cf2127d59bcac59cb7e" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3" FOREIGN KEY ("activeLeaderboardId") REFERENCES "leaderboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_da1c78142007c621b5498c818c1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "following" ADD CONSTRAINT "FK_6516c5a6f3c015b4eed39978be5" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "following" ADD CONSTRAINT "FK_80463ab7e0c3ed2868a59816af8" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" ADD CONSTRAINT "FK_a2ff790c4ab5ef3e53b8ac30d6e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_4c67b75cf47f3fd43f6811c8b42" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_00b4b8b25ccecde64c38331fbad" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_538c1b09794a6d0db076a47e701" FOREIGN KEY ("sportId") REFERENCES "sport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" ADD CONSTRAINT "FK_122dad8c29645869f138d44b7cd" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_4b25fd89ec49566db04d95da602" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_f8116b854f18829d8227971199e" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c" FOREIGN KEY ("relatedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_2c0c26f18495c64ed1ebdeb41d9" FOREIGN KEY ("relatedHealthActivityId") REFERENCES "health_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" ADD CONSTRAINT "FK_89b8906d1f1e378646460b23f7a" FOREIGN KEY ("relatedGoalsEntryId") REFERENCES "goals_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_390395c3d8592e3e8d8422ce853" FOREIGN KEY ("settingsId") REFERENCES "users_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" ADD CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD CONSTRAINT "FK_43b1794a1634ffc6f076c2b440d" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" ADD CONSTRAINT "FK_d83c66a1cf262655809d1107733" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_3c99a6098a3a33c955b15194cea" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_d26804bd34b21eecb76a29fec4a" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_41f1c0d60f9febd68796b80a634" FOREIGN KEY ("fromPhotoId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_4d839876775b00a4a45252c76ef" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_f502cb50a88813f9805bd60b604" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_d1db5694bca43f0622512bc1856" FOREIGN KEY ("resolvedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" ADD CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league_users_user" ADD CONSTRAINT "FK_e0d5b66fcf0fea207425e3a36e9" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league_users_user" ADD CONSTRAINT "FK_26f74c894928a31deb68f514e0c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "team_users_user" ADD CONSTRAINT "FK_e51365666f6e400fe5f85d709ab" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "team_users_user" ADD CONSTRAINT "FK_3645709c5fc6fa1178ebe7f7b9c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_users_user" DROP CONSTRAINT "FK_3645709c5fc6fa1178ebe7f7b9c"`
    )
    await queryRunner.query(
      `ALTER TABLE "team_users_user" DROP CONSTRAINT "FK_e51365666f6e400fe5f85d709ab"`
    )
    await queryRunner.query(
      `ALTER TABLE "league_users_user" DROP CONSTRAINT "FK_26f74c894928a31deb68f514e0c"`
    )
    await queryRunner.query(
      `ALTER TABLE "league_users_user" DROP CONSTRAINT "FK_e0d5b66fcf0fea207425e3a36e9"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_4edd12c99766f39e83829c8f6cb"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams_invitation" DROP CONSTRAINT "FK_d1db5694bca43f0622512bc1856"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_f502cb50a88813f9805bd60b604"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_4d839876775b00a4a45252c76ef"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_41f1c0d60f9febd68796b80a634"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_d26804bd34b21eecb76a29fec4a"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_b9d0d45d77e468323660b8fd6a1"`
    )
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_e9780bcaf4dc375f939fe904f6d"`
    )
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_3c99a6098a3a33c955b15194cea"`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" DROP CONSTRAINT "FK_d83c66a1cf262655809d1107733"`
    )
    await queryRunner.query(
      `ALTER TABLE "reward" DROP CONSTRAINT "FK_43b1794a1634ffc6f076c2b440d"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_758ebc8a1022731cb6ae4f50a0c"`
    )
    await queryRunner.query(
      `ALTER TABLE "rewards_redemption" DROP CONSTRAINT "FK_35341dc6a3bc6a9ff33b40dfff2"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_390395c3d8592e3e8d8422ce853"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5"`
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_89b8906d1f1e378646460b23f7a"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_2c0c26f18495c64ed1ebdeb41d9"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_7c7f5a4626dd76413d55c33da4c"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_f8116b854f18829d8227971199e"`
    )
    await queryRunner.query(
      `ALTER TABLE "feed_item" DROP CONSTRAINT "FK_4b25fd89ec49566db04d95da602"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_122dad8c29645869f138d44b7cd"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_538c1b09794a6d0db076a47e701"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_00b4b8b25ccecde64c38331fbad"`
    )
    await queryRunner.query(
      `ALTER TABLE "health_activity" DROP CONSTRAINT "FK_4c67b75cf47f3fd43f6811c8b42"`
    )
    await queryRunner.query(
      `ALTER TABLE "goals_entry" DROP CONSTRAINT "FK_a2ff790c4ab5ef3e53b8ac30d6e"`
    )
    await queryRunner.query(
      `ALTER TABLE "following" DROP CONSTRAINT "FK_80463ab7e0c3ed2868a59816af8"`
    )
    await queryRunner.query(
      `ALTER TABLE "following" DROP CONSTRAINT "FK_6516c5a6f3c015b4eed39978be5"`
    )
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_da1c78142007c621b5498c818c1"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_333bcd11efd8b4f41161f3ad9a5"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard" DROP CONSTRAINT "FK_e6a53f49cf2127d59bcac59cb7e"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "FK_8f67aa13411be7845fa46826e43"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "FK_747dfc8de16228a2d005c2e1d66"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "FK_a141ea198d96dd0b959cc5c1a63"`
    )
    await queryRunner.query(
      `ALTER TABLE "organisation" DROP CONSTRAINT "FK_fa7be9232bedf81dade53d50bd2"`
    )
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_21b660ac3034e8cd7e2f343a9c4"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP COLUMN "userId"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP COLUMN "leaderboardId"`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "PK_1fc8b5e6ca39eef72154ff25654"`
    )
    await queryRunner.query(`ALTER TABLE "leaderboard_entry" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD "leaderboard_entry_id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "PK_1a76e9207b9f19d1d02bdf45b58" PRIMARY KEY ("leaderboard_entry_id")`
    )
    await queryRunner.query(`DROP INDEX "IDX_3645709c5fc6fa1178ebe7f7b9"`)
    await queryRunner.query(`DROP INDEX "IDX_e51365666f6e400fe5f85d709a"`)
    await queryRunner.query(`DROP TABLE "team_users_user"`)
    await queryRunner.query(`DROP INDEX "IDX_26f74c894928a31deb68f514e0"`)
    await queryRunner.query(`DROP INDEX "IDX_e0d5b66fcf0fea207425e3a36e"`)
    await queryRunner.query(`DROP TABLE "league_users_user"`)
    await queryRunner.query(`DROP TABLE "teams_invitation"`)
    await queryRunner.query(`DROP TABLE "leagues_invitation"`)
    await queryRunner.query(`DROP TABLE "activity"`)
    await queryRunner.query(`DROP TABLE "team"`)
    await queryRunner.query(`DROP TABLE "reward"`)
    await queryRunner.query(`DROP TABLE "rewards_redemption"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TYPE "user_unit_system_enum"`)
    await queryRunner.query(`DROP TABLE "refresh_token"`)
    await queryRunner.query(`DROP TABLE "feed_item"`)
    await queryRunner.query(`DROP TYPE "feed_item_group_enum"`)
    await queryRunner.query(`DROP TYPE "feed_item_event_enum"`)
    await queryRunner.query(`DROP TABLE "health_activity"`)
    await queryRunner.query(`DROP TABLE "goals_entry"`)
    await queryRunner.query(`DROP TABLE "following"`)
    await queryRunner.query(`DROP TABLE "users_setting"`)
    await queryRunner.query(`DROP TYPE "users_setting_privacy_activities_enum"`)
    await queryRunner.query(
      `DROP TYPE "users_setting_privacy_daily_statistics_enum"`
    )
    await queryRunner.query(`DROP TABLE "provider"`)
    await queryRunner.query(`DROP TYPE "provider_type_enum"`)
    await queryRunner.query(`DROP TABLE "league"`)
    await queryRunner.query(`DROP TABLE "sport"`)
    await queryRunner.query(`DROP TABLE "leaderboard"`)
    await queryRunner.query(`DROP TABLE "organisation"`)
    await queryRunner.query(`DROP TYPE "organisation_type_enum"`)
    await queryRunner.query(`DROP TABLE "image"`)
    await queryRunner.query(`DROP TYPE "image_type_enum"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e60613e401d7320db8372d4cc3" ON "leaderboard_entry" ("leaderboard_id", "user_id") `
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class LeaguesStructureChanges1624261653546
  implements MigrationInterface {
  name = 'LeaguesStructureChanges1624261653546'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_41f1c0d60f9febd68796b80a634"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_4d839876775b00a4a45252c76ef"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "REL_41f1c0d60f9febd68796b80a63"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP COLUMN "fromPhotoId"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "REL_4d839876775b00a4a45252c76e"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP COLUMN "teamId"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "duration" integer NOT NULL DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "repeat" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "access" character varying NOT NULL DEFAULT 'private'`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD "invite_permission" character varying NOT NULL DEFAULT 'participant'`
    )
    await queryRunner.query(`ALTER TABLE "league" ADD "ownerId" uuid`)
    await queryRunner.query(`ALTER TABLE "league" ADD "imageId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "UQ_d05d728f48041926f7e8b1bbf8b" UNIQUE ("imageId")`
    )
    await queryRunner.query(`ALTER TABLE "league" ADD "organisationId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_f502cb50a88813f9805bd60b604"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."toUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "REL_d06901d7d8ddd16428e78f6b66"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."fromUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "REL_c7f6673e26cce517c07f696fe4"`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."leagueId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "REL_f502cb50a88813f9805bd60b60"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3" FOREIGN KEY ("activeLeaderboardId") REFERENCES "leaderboard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_96e35857cf176619917da040885" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_d05d728f48041926f7e8b1bbf8b" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_b0e389f19d97b2ca281fa6d956f" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_f502cb50a88813f9805bd60b604" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_f502cb50a88813f9805bd60b604"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" DROP CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_b0e389f19d97b2ca281fa6d956f"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_d05d728f48041926f7e8b1bbf8b"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_96e35857cf176619917da040885"`
    )
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3"`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "REL_f502cb50a88813f9805bd60b60" UNIQUE ("leagueId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."leagueId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "REL_c7f6673e26cce517c07f696fe4" UNIQUE ("fromUserId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."fromUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "REL_d06901d7d8ddd16428e78f6b66" UNIQUE ("toUserId")`
    )
    await queryRunner.query(
      `COMMENT ON COLUMN "leagues_invitation"."toUserId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_f502cb50a88813f9805bd60b604" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_c7f6673e26cce517c07f696fe4e" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_d06901d7d8ddd16428e78f6b667" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "organisationId"`)
    await queryRunner.query(
      `ALTER TABLE "league" DROP CONSTRAINT "UQ_d05d728f48041926f7e8b1bbf8b"`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "imageId"`)
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "ownerId"`)
    await queryRunner.query(
      `ALTER TABLE "league" DROP COLUMN "invite_permission"`
    )
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "access"`)
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "repeat"`)
    await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "duration"`)
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD "teamId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "REL_4d839876775b00a4a45252c76e" UNIQUE ("teamId")`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD "fromPhotoId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "REL_41f1c0d60f9febd68796b80a63" UNIQUE ("fromPhotoId")`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_4d839876775b00a4a45252c76ef" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "leagues_invitation" ADD CONSTRAINT "FK_41f1c0d60f9febd68796b80a634" FOREIGN KEY ("fromPhotoId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "league" ADD CONSTRAINT "FK_5cd1b613fa6fd1db28b5a78f7b3" FOREIGN KEY ("activeLeaderboardId") REFERENCES "leaderboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}

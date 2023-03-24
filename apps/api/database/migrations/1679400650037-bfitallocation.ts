import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import {
  getDailyBfitTotal,
  leagueBfitPots
} from '../../src/helpers/bfit-helpers'

export class bfitallocation1679400650037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('league', [
      new TableColumn({
        name: 'bfitAllocation',
        type: 'numeric',
        default: 0
      }),
      new TableColumn({
        name: 'bfitWinnerPot',
        type: 'numeric',
        default: 0
      })
    ])

    //comment out this part because it's failing in the update step
    /*
    // Calculate the total number of users in all leagues with access set to 'competetoearn'
    const totalUsersCount = await queryRunner.query(`
            WITH total_users AS (
                SELECT league_users_user."leagueId",  COUNT(league_users_user."userId") as totalUsers
                FROM league_users_user
                INNER JOIN league ON league_users_user."leagueId" = league.id
                WHERE league.access = 'competetoearn'
                GROUP BY league_users_user."leagueId"
            )
            SELECT SUM(totalUsers) as totalUsersCount
            FROM total_users
        `)

    const globalTotalUsersCount = totalUsersCount[0].totalUsersCount

    // Calculate the total number of users in each league with access set to 'competetoearn'
    const leagueUsers = await queryRunner.query(`
            SELECT league_users_user."leagueId" AS leagueId, COUNT(league_users_user."userId") AS totalUsers
            FROM league_users_user
            INNER JOIN league ON league_users_user."leagueId" = league.id
            WHERE league.access = 'competetoearn'
            GROUP BY league_users_user."leagueId"
        `)

    // Calculate the allocation for each league and update the "league" table
    for (const leagueUser of leagueUsers) {
      const [bfitAllocation, bfitWinnerPot] = leagueBfitPots(
        leagueUser.totalUsers,
        globalTotalUsersCount
      )
      await queryRunner.query(
        `
                UPDATE league
                SET bfitAllocation = $1,
                SET bfitWinnerPot = $2
                WHERE id = $3
            `,
        [bfitAllocation, bfitWinnerPot, leagueUser.leagueId]
      )
    }
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('league', 'bfitAllocation')
    await queryRunner.dropColumn('league', 'bfitWinnerPot')
  }
}

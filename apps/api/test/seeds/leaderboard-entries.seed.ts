import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import * as chalk from 'chalk'

const COUNT_LEADERBOARD_ENTRIES = 2

const date = new Date()

export class LeaderboardEntriesSetup implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const leaderboard = await connection.getRepository(Leaderboard).findOne()
    const user = await connection.getRepository(User).findOne()

    if (!leaderboard || !user) {
      console.log(
        chalk.bgRed(
          'Leaderboard & user seed must be run before leaderboard entry seed'
        )
      )
      return
    }

    await factory(LeaderboardEntry)({ leaderboard, user }).createMany(
      COUNT_LEADERBOARD_ENTRIES,
      {
        created_at: date
      }
    )
  }
}

export class LeaderboardEntriesTeardown implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(LeaderboardEntry).delete({
      created_at: date
    })
  }
}

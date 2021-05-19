import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import * as chalk from 'chalk'

const COUNT_LEADERBOARDS = 2

const date = new Date()

export class LeaderboardsSetup implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const league = await connection.getRepository(League).findOne()

    if (!league) {
      console.log(
        chalk.bgRed('League seed must be run before leaderboard seed')
      )
    }

    await factory(Leaderboard)({ league }).createMany(COUNT_LEADERBOARDS, {
      created_at: date
    })
  }
}

export class LeaderboardsTeardown implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(Leaderboard).delete({
      created_at: date
    })
  }
}

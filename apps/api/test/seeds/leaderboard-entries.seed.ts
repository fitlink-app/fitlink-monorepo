import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection, In } from 'typeorm'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { UsersSetup, UsersTeardown } from './users.seed'
import { LeaderboardsSetup, LeaderboardsTeardown } from './leaderboards.seed'
import { User } from '../../src/modules/users/entities/user.entity'

const COUNT_LEADERBOARD_ENTRIES = 10

export async function LeaderboardEntriesSetup(
  name: string,
  count = COUNT_LEADERBOARD_ENTRIES
): Promise<LeaderboardEntry[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory): Promise<any> {
      const { users, leaderboard } = await this.setupDependencies()

      return Promise.all(
        users.map((user) => {
          return factory(LeaderboardEntry)({ leaderboard, user }).create()
        })
      )
    }

    async setupDependencies() {
      const users = await UsersSetup(name, count)
      const leaderboards = await LeaderboardsSetup(name, 1)
      return {
        users,
        leaderboard: leaderboards[0]
      }
    }
  }

  return runSeeder(Setup)
}

export async function LeaderboardEntriesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const users = await connection.getRepository(User).find({
        where: { name },
        take: 1000
      })
      await connection
        .getRepository(LeaderboardEntry)
        .delete({ user: In(users) })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      await UsersTeardown(name)
      await LeaderboardsTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

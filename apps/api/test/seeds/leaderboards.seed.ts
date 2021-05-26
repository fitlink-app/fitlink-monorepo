import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaguesSetup, LeaguesTeardown } from './leagues.seed'

const COUNT_LEADERBOARDS = 2

const date = new Date()

export async function LeaderboardsSetup(
  name: string,
  count = COUNT_LEADERBOARDS
): Promise<Leaderboard[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const league = await this.setupDependencies()

      return factory(Leaderboard)({ league }).createMany(COUNT_LEADERBOARDS, {
        created_at: date
      })
    }

    async setupDependencies() {
      const leagues = await LeaguesSetup(name, 1)
      return leagues[0]
    }
  }

  return runSeeder(Setup)
}

export async function LeaderboardsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Leaderboard).delete({
        league: { name }
      })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      await LeaguesTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

import { Factory, runSeeder, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { TeamsSetup, TeamsTeardown } from './teams.seed'

const COUNT_LEAGUES = 2

export function LeaguesSetup(
  name: string,
  count = COUNT_LEAGUES
): Promise<League[]> {
  class TestingLeagueSeed implements Seeder {
    public async run(factory: Factory): Promise<any> {
      /**
       * This seeded data lives only to be tested on die and then be reborn.
       */
      return factory(League)().createMany(count, {
        name
      })
    }
  }

  return runSeeder(TestingLeagueSeed)
}

export function LeaguesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      const leagueRepository: Repository<League> = connection.getRepository(
        League
      )
      await leagueRepository.delete({ name })
    }
  }

  return runSeeder(Teardown)
}

export function TeamAssignedLeagueSetup(name: string): Promise<League> {
  class Setup implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
      /**
       * This is seed lives only to be tested on die and be reborn.
       * And It's already assigned to a team.
       */
      const { team } = await this.setupDependencies()

      return factory(League)().create({
        name,
        description: `${name} description`,
        team
      })
    }

    async setupDependencies() {
      const teams = await TeamsSetup(name, 1)
      return {
        team: teams[0]
      }
    }
  }

  return runSeeder(Setup)
}

export function TeamAssignedLeagueTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      const leagueRepository: Repository<League> = connection.getRepository(
        League
      )
      await leagueRepository.delete({ name })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      return TeamsTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

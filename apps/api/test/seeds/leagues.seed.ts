import { Factory, runSeeder, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { TeamsSetup, TeamsTeardown } from './teams.seed'
import { OrganisationsSetup, OrganisationsTeardown } from './organisations.seed'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

const COUNT_LEAGUES = 2

export function LeaguesWithUsersAndEntriesSetup(
  name: string,
  count = COUNT_LEAGUES,
  users?: User[]
): Promise<League[]> {
  class TestingLeagueSeed implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
      /**
       * This seeded data lives only to be tested on die and then be reborn.
       */
      const leagues = await factory(League)().createMany(count, {
        name
      })
      const leaderboards = await Promise.all(
        leagues.map((league) => {
          return factory(Leaderboard)({ league }).create()
        })
      )
      const sport = await connection
        .getRepository(Sport)
        .findOne({ where: { name_key: 'cycling' } })

      await Promise.all(
        leagues.map(async (league, index: number) => {
          league.leaderboards = [leaderboards[index]]
          league.active_leaderboard = leaderboards[index]
          league.users = [users[index]]
          league.sport = sport
          await Promise.all(
            users.map((user) => {
              return factory(LeaderboardEntry)({
                user,
                leaderboard: league.active_leaderboard
              }).create({ points: 8300 })
            })
          )
          return connection.getRepository(League).save(league)
        })
      )
      return leagues
    }
  }
  return runSeeder(TestingLeagueSeed)
}

export function LeaguesSetup(
  name: string,
  count = COUNT_LEAGUES
): Promise<League[]> {
  class TestingLeagueSeed implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
      /**
       * This seeded data lives only to be tested on die and then be reborn.
       */
      const leagues = await factory(League)().createMany(count, {
        name
      })

      const leaderboards = await Promise.all(
        leagues.map((league) => {
          return factory(Leaderboard)({ league }).create()
        })
      )

      await Promise.all(
        leagues.map((league, index: number) => {
          league.leaderboards = [leaderboards[index]]
          league.active_leaderboard = leaderboards[index]
          return connection.getRepository(League).save(league)
        })
      )

      return leagues
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

      const leaderboardRepository: Repository<Leaderboard> = connection.getRepository(
        Leaderboard
      )

      const leagues = await leagueRepository.find({
        where: { name },
        relations: ['leaderboards']
      })

      await Promise.all(
        leagues.map((league) => {
          return Promise.all(
            league.leaderboards.map((leaderboard) => {
              return leaderboardRepository.delete(leaderboard.id)
            })
          )
        })
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

export function OrganisationAssignedLeagueSetup(name: string): Promise<League> {
  class Setup implements Seeder {
    connection: Connection
    public async run(factory: Factory, connection: Connection): Promise<any> {
      this.connection = connection
      /**
       * This is seed lives only to be tested on die and be reborn.
       * And It's already assigned to a team.
       */
      const { organisation } = await this.setupDependencies()

      return factory(League)().create({
        name,
        description: `${name} description`,
        organisation
      })
    }

    async setupDependencies() {
      const [organisation] = await OrganisationsSetup(name, 1)
      const [team] = await TeamsSetup(name, 1)

      await this.connection
        .getRepository(Team)
        .createQueryBuilder('teams')
        .relation(Team, 'organisation')
        .of(team)
        .set(organisation)

      organisation.teams = [team]

      return { organisation }
    }
  }

  return runSeeder(Setup)
}

export function OrganisationAssignedLeagueTeardown(
  name: string
): Promise<void> {
  class Teardown implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      const leagueRepository: Repository<League> = connection.getRepository(
        League
      )
      await leagueRepository.delete({ name })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      return OrganisationsTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

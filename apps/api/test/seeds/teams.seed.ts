import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { OrganisationsSetup, OrganisationsTeardown } from './organisations.seed'
import { UsersSetup, UsersTeardown } from './users.seed'
import { User } from '../../src/modules/users/entities/user.entity'

const COUNT_TEAMS = 2
const COUNT_USERS = 10
const TOTAL_USERS = COUNT_TEAMS * COUNT_USERS

export async function TeamsSetup(
  name: string,
  count = COUNT_TEAMS
): Promise<Team[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const { organisation, users } = await this.setupDependencies()
      const teams = await factory(Team)({ organisation }).createMany(count, {
        name
      })

      // Add COUNT_USERS (.e.g 10 per team)
      await Promise.all(
        users.map((user, index) => {
          const team = Math.floor(index / COUNT_USERS)
          user.teams = [teams[team]]
          return connection.getRepository(User).save(user)
        })
      )

      return teams
    }

    async setupDependencies() {
      const organisations = await OrganisationsSetup(name, 1)
      const users = await UsersSetup(name, TOTAL_USERS)
      return {
        organisation: organisations[0],
        users
      }
    }
  }

  return runSeeder(Setup)
}

export async function TeamsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Team).delete({ name })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      await UsersTeardown(name)
      await OrganisationsTeardown(name)
    }
  }

  await runSeeder(Teardown)
}

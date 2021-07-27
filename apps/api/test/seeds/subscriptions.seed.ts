import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { OrganisationsSetup, OrganisationsTeardown } from './organisations.seed'
import { UsersSetup, UsersTeardown } from './users.seed'
import { TeamsSetup, TeamsTeardown } from './teams.seed'
import { Team } from '../../src/modules/teams/entities/team.entity'

const COUNT_ORGANISATIONS = 1
const COUNT_SUBSCRIPTIONS = 2
const COUNT_USERS = 10

export async function SubscriptionsSetup(
  billing_entity: string
): Promise<Subscription[]> {
  const countUsers = COUNT_SUBSCRIPTIONS * COUNT_USERS
  const name = billing_entity

  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const { organisations, teams, users } = await this.setupDependencies()

      const organisation = organisations[0]

      const subscriptions = await factory(Subscription)({
        organisation
      }).createMany(COUNT_SUBSCRIPTIONS, {
        billing_entity
      })

      await Promise.all(
        teams.map((team) => {
          team.organisation = organisation
          return connection.getRepository(Team).save(team)
        })
      )

      // Add COUNT_USERS (.e.g 10 per subscription)
      await Promise.all(
        users.map((user, index) => {
          const sub = Math.floor(index / COUNT_USERS)
          user.subscription = subscriptions[sub]
          return connection.getRepository(User).save(user)
        })
      )

      return subscriptions
    }

    async setupDependencies() {
      const organisations = await OrganisationsSetup(name, COUNT_ORGANISATIONS)
      const teams = await TeamsSetup(name, COUNT_SUBSCRIPTIONS)
      const users = await UsersSetup(name, countUsers)
      return {
        organisations,
        teams,
        users
      }
    }
  }
  return runSeeder(Setup)
}

export async function SubscriptionsTeardown(
  billing_entity: string
): Promise<void> {
  const name = billing_entity

  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Subscription).delete({
        billing_entity
      })
      await this.teardownDependencies()
    }

    async teardownDependencies() {
      await UsersTeardown(name)
      await TeamsTeardown(name)
      await OrganisationsTeardown(name)
    }
  }
  await runSeeder(Teardown)
}

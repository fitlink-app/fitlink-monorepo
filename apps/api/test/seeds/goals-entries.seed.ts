import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'
import { GoalsEntry } from '../../src/modules/goals-entries/entities/goals-entry.entity'
import { UsersSetup, UsersTeardown } from './users.seed'
import * as faker from 'faker'

const USERS_COUNT = 10

export async function GoalsEntriesSetup(
  name: string,
  count = USERS_COUNT
): Promise<GoalsEntry[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      this.connection = connection
      const users = await this.setupDependencies()
      const goalEntries = await Promise.all(
        users.map((user) => {
          return factory(GoalsEntry)({ user }).create()
        })
      )

      return goalEntries
    }

    async setupDependencies() {
      const users = await UsersSetup(name, count)
      return Promise.all(
        users.map((user) => {
          user.goal_mindfulness_minutes = faker.datatype.number(59)
          user.goal_steps = faker.datatype.number(100000)
          user.goal_floors_climbed = faker.datatype.number(15)
          user.goal_water_litres = faker.datatype.number(5)
          user.goal_sleep_hours = faker.datatype.number(14)
          return this.connection.getRepository(User).save(user)
        })
      )
    }
  }

  return runSeeder(Setup)
}

export async function GoalsEntriesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(_factory: Factory, connection: Connection): Promise<any> {
      const users = await connection.getRepository(User).find({
        where: { name },
        take: 1000,
        relations: ['goals_entries']
      })

      await Promise.all(
        users.map((user) => {
          return connection
            .getRepository(GoalsEntry)
            .delete(user.goals_entries.map((e) => e.id))
        })
      )

      await this.teardownDependencies()
    }

    async teardownDependencies() {
      return UsersTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

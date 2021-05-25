import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'

const USERS_COUNT = 10

export async function UsersSetup(
  name: string,
  count = USERS_COUNT
): Promise<User[]> {
  class Setup implements Seeder {
    public async run(factory: Factory): Promise<any> {
      return factory(User)().createMany(count, { name })
    }
  }

  return runSeeder(Setup)
}

export async function UsersTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(User).delete({
        name
      })
    }
  }

  return runSeeder(Teardown)
}

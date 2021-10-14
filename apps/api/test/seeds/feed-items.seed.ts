import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { UsersSetup, UsersTeardown } from './users.seed'
import { User } from '../../src/modules/users/entities/user.entity'
import { FeedItem } from '../../src/modules/feed-items/entities/feed-item.entity'

const COUNT_USERS = 2

export async function FeedItemsSetup(
  name: string,
  count = COUNT_USERS
): Promise<User[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const { users } = await this.setupDependencies()

      // Add COUNT_USERS (.e.g 10 per team)
      const feedItemUsers = await Promise.all(
        users.map(async (user) => {
          user.feed_items = []
          const result = await connection.getRepository(User).save(user)
          const feedItem = await factory(FeedItem)().create({ user: result })
          result.feed_items.push(feedItem)
          return result
        })
      )

      return feedItemUsers
    }

    async setupDependencies() {
      const users = await UsersSetup(name, COUNT_USERS)
      return {
        users
      }
    }
  }

  return runSeeder(Setup)
}

export async function FeedItemsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(FeedItem).delete({})
      await UsersTeardown(name)
    }
  }

  await runSeeder(Teardown)
}

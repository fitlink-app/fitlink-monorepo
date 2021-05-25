import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { UsersSetup, UsersTeardown } from './users.seed'

const USERS_COUNT = 10

export async function FollowingsSetup(
  name: string,
  count = USERS_COUNT
): Promise<Following[]> {
  class Setup implements Seeder {
    public async run(factory: Factory): Promise<any> {
      const users = await this.setupDependencies()

      const followings = await Promise.all(
        users.map((user, index) => {
          const followerUser = user
          const followingUser = users[index + 1] || users[index - 1]
          return factory(Following)({
            followerUser,
            followingUser
          }).create()
        })
      )

      return followings
    }

    async setupDependencies() {
      return UsersSetup(name, count)
    }
  }

  return runSeeder(Setup)
}

export async function FollowingsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      const users = await connection.getRepository(User).find({
        where: { name },
        take: 1000,
        relations: ['following', 'followers']
      })

      await Promise.all(
        users.map((user) => {
          return connection
            .getRepository(Following)
            .delete(user.followers.map((e) => e.id))
        })
      )

      await Promise.all(
        users.map((user) => {
          return connection
            .getRepository(Following)
            .delete(user.following.map((e) => e.id))
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

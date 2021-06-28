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
      if (USERS_COUNT < 2) {
        throw new Error('User count needs to be at least 2')
      }

      const users = await this.setupDependencies()
      const userToFollow = users[0]

      // Skip the first user in future
      users.shift()

      const followings = await Promise.all(
        users.map((followerUser) => {
          return factory(Following)({
            followerUser,
            followingUser: userToFollow
          }).create()
        })
      )

      const following = await factory(Following)({
        followerUser: userToFollow,
        followingUser: users[0]
      }).create()

      return [following, ...followings]
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

import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Reward } from '../../src/modules/rewards/entities/reward.entity'
import { ImagesSetup, ImagesTeardown } from './images.seed'
import { User } from '../../src/modules/users/entities/user.entity'
import { UsersSetup } from './users.seed'
import { v4 as uuid } from 'uuid'

const COUNT_REWARDS = 10

export function RewardsSetup(
  name: string,
  count = COUNT_REWARDS,
  override: Partial<Reward> = {}
): Promise<Reward[]> {
  class Setup implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
      /**
       * This seeded data lives only to be tested on die and then be reborn.
       */
      const { images } = await this.setupDependencies()

      return Promise.all(
        images.map((image) => {
          return factory(Reward)().create({
            name,
            image,
            ...override
          })
        })
      )
    }

    async setupDependencies() {
      const images = await ImagesSetup(name, count)
      return {
        images
      }
    }
  }

  return runSeeder(Setup)
}

export function RewardsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Reward).delete({
        name
      })
      await ImagesTeardown(name)
    }
  }

  return runSeeder(Teardown)
}

export function UserReachedReward(name: string, count: number = COUNT_REWARDS) {
  class Setup implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      const userRepository = connection.getRepository(User)
      const rand = uuid()
      const rewards = await RewardsSetup(name + rand, count, {
        points_required: 7
      })
      const user = await UsersSetup('UserBoutToBeRewarded C-' + rand, 1)
      user[0].points_total = rewards[0].points_required - 1
      await userRepository.save(user)

      return user[0]
    }
  }

  return runSeeder(Setup)
}

import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Reward } from '../../src/modules/rewards/entities/reward.entity'
import { Image } from '../../src/modules/images/entities/image.entity'

const REWARDS_COUNT = 37

export default class CreatePublicRewards implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    /**
     * Create rewards
     */
    return Promise.all(
      Array.from({ length: REWARDS_COUNT }).map(async () => {
        const image = await factory(Image)().create()
        const reward = await factory(Reward)().create({
          image
        })
        return reward
      })
    )
  }
}

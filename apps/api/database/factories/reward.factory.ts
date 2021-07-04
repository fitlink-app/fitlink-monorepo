import {
  Reward,
  RewardAccess
} from '../../src/modules/rewards/entities/reward.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { addDays } from 'date-fns'

define(Reward, (faker: typeof Faker) => {
  const reward = new Reward()
  reward.description = faker.lorem.words(10)
  reward.name = faker.lorem.words(5)
  reward.name_short = faker.lorem.words(3)
  reward.access = RewardAccess.Public
  reward.reward_expires_at = addDays(new Date(), 30)
  reward.brand = faker.company.companyName()
  reward.code = faker.company.companySuffix()
  reward.redeem_url = faker.internet.url()
  reward.points_required = 100
  return reward
})

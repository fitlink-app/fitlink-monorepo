import { League } from '../../src/modules/leagues/entities/league.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'

define(League, (faker: typeof Faker) => {
  const league = new League()
  league.description = faker.lorem.words(10)
  league.name = faker.random.arrayElement([
    'Runners club',
    'Runners at sunrise',
    'Lunchtime runners',
    'Run time',
    'Run run run'
  ])
  return league
})

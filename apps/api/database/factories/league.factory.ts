import { League } from '../../src/modules/leagues/entities/league.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'

define(League, (faker: typeof Faker) => {
  const league = new League()
  const leaderboard = new Leaderboard()
  league.description = faker.lorem.words(10)
  league.name = faker.random.arrayElement([
    'Runners club',
    'Runners at sunrise',
    'Lunchtime runners',
    'Run time',
    'Run run run'
  ])
  league.leaderboards = [leaderboard]
  league.active_leaderboard = leaderboard
  return league
})

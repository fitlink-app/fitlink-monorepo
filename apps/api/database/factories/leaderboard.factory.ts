import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'

interface Context {
  league: League
}

define(Leaderboard, (_faker: typeof Faker, context: Context) => {
  const leaderboard = new Leaderboard()
  leaderboard.league = context.league
  return leaderboard
})

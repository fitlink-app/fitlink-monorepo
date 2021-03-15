import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { User } from '../../src/modules/users/entities/user.entity'

interface Context {
  leaderboard: Leaderboard
  user: User
}

define(LeaderboardEntry, (faker: typeof Faker, context: Context) => {
  const entry = new LeaderboardEntry()
  entry.leaderboard = context.leaderboard

  // Temporary fields for legacy Firebse app
  entry.leaderboard_id = context.leaderboard.id
  entry.user_id = context.user.id
  entry.league_id = context.leaderboard.league.id
  // End

  entry.user = context.user
  entry.points = faker.random.number(500)
  entry.wins = faker.random.number(3)
  return entry
})

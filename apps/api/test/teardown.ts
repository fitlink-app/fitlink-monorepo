import { rm } from 'fs/promises'
import * as chalk from 'chalk'

export default async () => {
  try {
    // Clear email debug log (mocks AWS emails to log file)
    console.log(chalk.white.bgGreen(`Cleaning up test emails`))
    await rm('email-debug.log')
  } catch (e) {}
}

/*
  TODO: Planned for future, checks to ensure teardowns occurred correctly

  import { getRepository } from 'typeorm'
  import { Following } from '../src/modules/followings/entities/following.entity'
  import { mockApp } from './helpers/app'
  import { User } from '../src/modules/users/entities/user.entity'
  import { GoalsEntry } from '../src/modules/goals-entries/entities/goals-entry.entity'
  import { LeaderboardEntry } from '../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
  import { Leaderboard } from '../src/modules/leaderboards/entities/leaderboard.entity'
  import { League } from '../src/modules/leagues/entities/league.entity'
  import { Sport } from '../src/modules/sports/entities/sport.entity'
  import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
  import { Subscription } from '../src/modules/subscriptions/entities/subscription.entity'
  import { Team } from '../src/modules/teams/entities/team.entity'
  import { UserRole } from '../src/modules/user-roles/entities/user-role.entity'

  const app = await mockApp({})

  // Checks to warn about teardowns not working correctly
  countError("Following", (await getRepository(Following).count()))
  countError("User", (await getRepository(User).count()))
  countError("GoalsEntry", (await getRepository(GoalsEntry).count()))
  countError("League", (await getRepository(League).count()))
  countError("Leaderboard", (await getRepository(Leaderboard).count()))
  countError("LeaderboardEntry", (await getRepository(LeaderboardEntry).count()))
  countError("Sport", (await getRepository(Sport).count()))
  countError("Organisation", (await getRepository(Organisation).count()))
  countError("Subscription", (await getRepository(Subscription).count()))
  countError("Team", (await getRepository(Team).count()))
  countError("UserRole", (await getRepository(UserRole).count()))

  await app.close()

  function countError( name = '', count = 0 ){
    if( count > 0 ){
      console.log(chalk.white.bgYellow(`${name} did not complete teardown. ${count} objects remaining.`))
    }
  }
*/

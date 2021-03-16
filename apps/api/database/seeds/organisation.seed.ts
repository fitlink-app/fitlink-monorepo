import { Seeder, Factory } from 'typeorm-seeding'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { flatten } from 'lodash'
import * as faker from 'faker'

const COUNT_ORGANISATIONS = 2
const COUNT_TEAMS = 2
const COUNT_LEAGUES = 2
const COUNT_USERS = 21
const COUNT_LEADERBOARDS = 2
const COUNT_LEADERBOARD_ENTRIES = 2

export default class CreateOrganisations implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * Create organisations
     */
    const orgs = await factory(Organisation)().createMany(COUNT_ORGANISATIONS)

    /**
     * Create teams for organisations
     */
    const teams = await Promise.all(
      orgs.map(
        async (organisation) =>
          await factory(Team)({ organisation }).createMany(COUNT_TEAMS)
      )
    )

    /**
     * Create users within teams
     */
    const users = flatten(
      await Promise.all(
        teams.map(
          async (team) => await factory(User)({ team }).createMany(COUNT_USERS)
        )
      )
    )

    /**
     * Create leagues within teams
     */
    const leagues = flatten(
      await Promise.all(
        teams.map(
          async (team) =>
            await factory(League)({ team, users }).createMany(COUNT_LEAGUES)
        )
      )
    )

    /**
     * Create leaderboards within leagues
     */
    const leaderboards = flatten(
      await Promise.all(
        leagues.map(
          async (league) =>
            await factory(Leaderboard)({ league }).createMany(
              COUNT_LEADERBOARDS
            )
        )
      )
    )

    /**
     * Create leaderboard entries within leaderboards
     */
    const leaderboardEntries = flatten(
      await Promise.all(
        leaderboards.map(async (leaderboard) =>
          flatten(
            await Promise.all(
              faker.random
                .arrayElements(users, faker.random.number(users.length))
                .map(
                  async (user) =>
                    await factory(LeaderboardEntry)({
                      leaderboard,
                      user: user
                    }).createMany(COUNT_LEADERBOARD_ENTRIES)
                )
            )
          )
        )
      )
    )
  }
}

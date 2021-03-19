import { Seeder, Factory } from 'typeorm-seeding'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { flatten } from 'lodash'
import * as faker from 'faker'
import {
  Roles,
  UserRole
} from '../../src/modules/user-roles/entities/user-role.entity'
import { Connection } from 'typeorm'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'

const COUNT_ORGANISATIONS = 2
const COUNT_TEAMS = 2
const COUNT_SUBSCRIPTIONS = 2
const COUNT_LEAGUES = 2
const COUNT_USERS = 21
const COUNT_LEADERBOARDS = 2
const COUNT_LEADERBOARD_ENTRIES = 2
const COUNT_FOLLOWINGS = 1

export default class CreateOrganisations implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    this.connection = connection
    /**
     * Create organisations
     */
    const orgs = await factory(Organisation)().createMany(COUNT_ORGANISATIONS)

    /**
     * Create subscriptions for organisations
     */
    await Promise.all(
      orgs.map(
        async (organisation) =>
          await factory(Subscription)({ organisation }).createMany(
            COUNT_SUBSCRIPTIONS
          )
      )
    )

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
        teams.map(async (team) => {
          const users = await factory(User)().createMany(COUNT_USERS)
          await this.connection
            .getRepository(Team)
            .createQueryBuilder()
            .relation(Team, 'users')
            .of(team)
            .add(users)
          return users
        })
      )
    )

    /**
     * Create team admins
     */
    const teamAdmin = users[faker.random.number(users.length - 1)]
    const orgAdmin = users[faker.random.number(users.length - 1)]
    const subAdmin = users[faker.random.number(users.length - 1)]

    await Promise.all([
      await factory(UserRole)({
        user: teamAdmin,
        team: this.getTeamForUser(teamAdmin),
        role: Roles.TeamAdmin
      }).create(),

      await factory(UserRole)({
        user: orgAdmin,
        organisation: this.getOrganisationForUser(orgAdmin),
        role: Roles.OrganisationAdmin
      }).create(),

      await factory(UserRole)({
        user: subAdmin,
        subscription: this.getSubscriptionForUser(subAdmin),
        role: Roles.SubscriptionAdmin
      }).create()
    ])

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
    flatten(
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

    /**
     * Create followings for users
     */
    const followings = flatten(
      await Promise.all(
        users.map(
          async (user, idx) => {
            const nextUser = users[idx + 1]
            if (nextUser) {
              await factory(Following)({ followerUser: user, followingUser: nextUser }).createMany(
                COUNT_FOLLOWINGS
              )
            }
          }
        )
      )
    )
  }

  async getTeamForUser(user: User) {
    const result = await this.connection.getRepository(User).findOne(
      {
        id: user.id
      },
      {
        relations: ['teams']
      }
    )
    return result.teams[0]
  }

  async getOrganisationForUser(user: User) {
    const team = await this.getTeamForUser(user)
    const result = await this.connection.getRepository(Team).findOne(
      {
        id: team.id
      },
      {
        relations: ['organisation']
      }
    )
    return result.organisation
  }

  async getSubscriptionForUser(user: User) {
    const org = await this.getOrganisationForUser(user)
    const result = await this.connection.getRepository(Organisation).findOne(
      {
        id: org.id
      },
      {
        relations: ['subscriptions']
      }
    )
    return result.subscriptions[0]
  }
}

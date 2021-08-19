import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { RewardsModule } from '../src/modules/rewards/rewards.module'
import { useSeeding } from 'typeorm-seeding'
import { TeamsSetup, TeamsTeardown } from './seeds/teams.seed'
import { Team } from '../src/modules/teams/entities/team.entity'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { CreateRewardDto } from '../src/modules/rewards/dto/create-reward.dto'
import { ImagesSetup, ImagesTeardown } from './seeds/images.seed'
import { Image } from '../src/modules/images/entities/image.entity'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { User } from '../src/modules/users/entities/user.entity'
import { Connection, getConnection } from 'typeorm'
import { Reward } from '../src/modules/rewards/entities/reward.entity'
import { RewardAccess } from '../src/modules/rewards/rewards.constants'
import { RewardsSetup, RewardsTeardown } from './seeds/rewards.seed'
import { startOfDay } from 'date-fns'
import { FeedItem } from '../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedItemCategory,
  FeedItemType
} from '../src/modules/feed-items/feed-items.constants'

describe('Rewards', () => {
  let app: NestFastifyApplication
  let authHeaders: NodeJS.Dict<string>
  let teamAdminHeaders: NodeJS.Dict<string>
  let teamUserHeaders: NodeJS.Dict<string>
  let orgAdminHeaders: NodeJS.Dict<string>
  let superAdminHeaders: NodeJS.Dict<string>
  let team: Team, otherTeam: Team
  let organisation: Organisation, otherOrganisation: Organisation
  let images: Image[]
  let users: User[]
  let rewards: Reward[]

  beforeAll(async () => {
    app = await mockApp({
      imports: [RewardsModule],
      providers: []
    })

    await useSeeding()

    // Create these separately or they share the same org
    team = (await TeamsSetup('Test Rewards', 1))[0]
    otherTeam = (await TeamsSetup('Test Rewards', 1))[0]

    organisation = team.organisation
    otherOrganisation = otherTeam.organisation

    images = await ImagesSetup('Test Rewards', 20)
    users = await UsersSetup('Test Rewards', 2)
    rewards = await RewardsSetup('Test Rewards', 10)

    // User types
    authHeaders = getAuthHeaders({}, users[0].id)
    teamAdminHeaders = getAuthHeaders({ t_a: [team.id] })
    orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
    superAdminHeaders = getAuthHeaders({ spr: true })

    teamUserHeaders = getAuthHeaders({}, users[1].id)

    // Add user to the team
    await app
      .get(Connection)
      .getRepository(Team)
      .createQueryBuilder()
      .relation(Team, 'users')
      .of(team.id)
      .add(users[1].id)

    // Add reward to another team
    await app
      .get(Connection)
      .getRepository(Reward)
      .createQueryBuilder()
      .relation(Reward, 'team')
      .of(rewards[0].id)
      .set(otherTeam.id)

    await app.get(Connection).getRepository(Reward).update(rewards[0].id, {
      access: RewardAccess.Team
    })

    // Add reward to another org
    await app
      .get(Connection)
      .getRepository(Reward)
      .createQueryBuilder()
      .relation(Reward, 'organisation')
      .of(rewards[1].id)
      .set(otherOrganisation.id)

    await app.get(Connection).getRepository(Reward).update(rewards[1].id, {
      access: RewardAccess.Organisation
    })

    // Add reward to org
    await app
      .get(Connection)
      .getRepository(Reward)
      .createQueryBuilder()
      .relation(Reward, 'organisation')
      .of(rewards[3].id)
      .set(organisation.id)

    // Add reward to team
    await app
      .get(Connection)
      .getRepository(Reward)
      .createQueryBuilder()
      .relation(Reward, 'team')
      .of(rewards[4].id)
      .set(team.id)

    // Add points to user
    await app.get(Connection).getRepository(User).update(users[0].id, {
      points_total: 250
    })
  })

  afterAll(async () => {
    await TeamsTeardown('Test Rewards')
    await ImagesTeardown('Test Rewards')
    await UsersTeardown('Test Rewards')
    await RewardsTeardown('Test Rewards')
    await app.close()
  })

  const testAll = test.each([
    ['a superadmin', () => superAdminHeaders],
    ['an organisation admin', () => orgAdminHeaders],
    ['a team admin', () => teamAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  const dto: CreateRewardDto = {
    name: 'Test Rewards',
    description: 'Get 10% off Fitlink subscription!',
    brand: 'Fitlink',
    name_short: '10% off Fitlink subscription',
    code: 'FIT10',
    points_required: 10,
    redeem_url: 'https://fitlinkapp.com?redeem=fit10',
    reward_expires_at: new Date().toISOString(),
    imageId: ''
  }

  testAll(
    `POST /rewards (201, 403) Creating public reward`,
    async (type, getHeaders) => {
      const payload = {
        ...dto,
        imageId: images[0].id
      }

      const result = await app.inject({
        method: 'POST',
        url: `/rewards`,
        headers: getHeaders(),
        payload
      })

      if (type === 'a superadmin') {
        expect(result.statusCode).toBe(201)
        expect(result.json().id).toBeDefined()
        expect(result.json().access).toBe('public')
        expect(result.json().image.id).toBeDefined()
        expect(result.json().organisation).toBeUndefined()
        expect(result.json().team).toBeUndefined()
      } else {
        expect(result.statusCode).toBe(403)
      }
    }
  )

  testAll(
    `POST /organisations/:id/rewards (201, 403) Creating organisation level reward`,
    async (type, getHeaders) => {
      let imageId
      if (type === 'a superadmin' || type === 'an organisation admin') {
        imageId = images.pop().id
      }

      const payload = {
        ...dto,
        imageId
      }

      const result = await app.inject({
        method: 'POST',
        url: `/organisations/${organisation.id}/rewards`,
        headers: getHeaders(),
        payload
      })

      if (type === 'a superadmin' || type === 'an organisation admin') {
        expect(result.statusCode).toBe(201)
        expect(result.json().id).toBeDefined()
        expect(result.json().access).toBe('organisation')
        expect(result.json().organisation.id).toBeDefined()
        expect(result.json().image.id).toBeDefined()
        expect(result.json().team).toBeUndefined()
      } else {
        expect(result.statusCode).toBe(403)
      }
    }
  )

  testAll(
    `POST /teams/:id/rewards (201, 403) Creating team-level reward`,
    async (type, getHeaders) => {
      let imageId
      if (type === 'a superadmin' || type === 'a team admin') {
        imageId = images.pop().id
      }

      const payload = {
        ...dto,
        imageId
      }

      const result = await app.inject({
        method: 'POST',
        url: `/teams/${team.id}/rewards`,
        headers: getHeaders(),
        payload
      })

      if (type === 'a superadmin' || type === 'a team admin') {
        expect(result.statusCode).toBe(201)
        expect(result.json().id).toBeDefined()
        expect(result.json().team.id).toBeDefined()
        expect(result.json().image.id).toBeDefined()
        expect(result.json().access).toBe('team')
        expect(result.json().organisation).toBeUndefined()
      } else {
        expect(result.statusCode).toBe(403)
      }
    }
  )

  it(`GET /rewards (200) A superadmin can get any rewards`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: superAdminHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(result.statusCode).toBe(200)

    expect(result.json().results.length).toBeGreaterThanOrEqual(1)
    expect(
      result.json().results.filter((e) => e.access === RewardAccess.Team).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      result
        .json()
        .results.filter((e) => e.access === RewardAccess.Organisation).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      result.json().results.filter((e) => e.access === RewardAccess.Public)
        .length
    ).toBeGreaterThanOrEqual(1)
  })

  it(`GET /rewards (200) A superadmin can get a single non-public reward`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[0].id}`,
      headers: superAdminHeaders
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().id).toBeDefined()
    expect(result.json().image.id).toBeDefined()
    expect(result.json().access).toBe('team')
  })

  it(`GET /rewards (201, 403) An ordinary user can get public rewards only`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: authHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(result.statusCode).toBe(200)

    const results = result.json().results

    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(
      results.filter((e) => e.access === RewardAccess.Public).length
    ).toEqual(results.length)
  })

  it(`GET /rewards (200) An ordinary user can only get a public single reward`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[0].id}`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(403)

    const result1 = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[1].id}`,
      headers: authHeaders
    })

    expect(result1.statusCode).toBe(403)

    const resultOk = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[2].id}`,
      headers: authHeaders
    })

    expect(resultOk.statusCode).toBe(200)
    expect(resultOk.json().id).toBeDefined()
    expect(resultOk.json().image.id).toBeDefined()
    expect(resultOk.json().access).toBe('public')
  })

  it(`GET /rewards (200) A team user can get both public and team, and organisation rewards`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: teamUserHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(result.statusCode).toBe(200)

    const results = result.json().results
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(
      results.filter((e) => e.access === RewardAccess.Public).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      results.filter((e) => e.access === RewardAccess.Team).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      results.filter((e) => e.access === RewardAccess.Organisation).length
    ).toBeGreaterThanOrEqual(1)

    // A user cannot see another team's rewards
    expect(
      results.filter((e) => e.team && e.team.id === otherTeam.id).length
    ).toBe(0)

    // A user cannot see another organisations's rewards
    expect(
      results.filter(
        (e) => e.organisation && e.organisation.id === otherOrganisation.id
      ).length
    ).toBe(0)
  })

  it(`GET /rewards (200) A team user can get both public and team, and organisation single reward`, async () => {
    const result1 = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[3].id}`,
      headers: teamUserHeaders
    })

    expect(result1.statusCode).toBe(200)
    expect(result1.json().id).toBeDefined()
    expect(result1.json().image.id).toBeDefined()
    expect(result1.json().organisation.id).toBeDefined()

    // Team level
    const result2 = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[4].id}`,
      headers: teamUserHeaders
    })

    expect(result2.statusCode).toBe(200)
    expect(result2.json().id).toBeDefined()
    expect(result2.json().image.id).toBeDefined()
    expect(result2.json().team.id).toBeDefined()

    // Public
    const result3 = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[5].id}`,
      headers: teamUserHeaders
    })

    expect(result3.statusCode).toBe(200)
    expect(result3.json().id).toBeDefined()
    expect(result3.json().image.id).toBeDefined()
    expect(result3.json().access).toBe('public')
  })

  it(`GET /rewards (200) A team user cannot get a reward from another organisation`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[1].id}`,
      headers: teamUserHeaders
    })

    expect(result.statusCode).toBe(403)
  })

  testAll(
    `PUT /rewards (200, 403) Updating rewards`,
    async (type, getHeaders) => {
      let imageId1 = images.pop().id
      let imageId2 = images.pop().id
      let imageId3 = images.pop().id

      const payload = {
        ...dto,
        name: dto.name + ' UPDATED',
        imageId: imageId1
      }

      const result1 = await app.inject({
        method: 'PUT',
        url: `/organisations/${organisation.id}/rewards/${rewards[3].id}`,
        headers: getHeaders(),
        payload
      })

      if (type === 'a superadmin' || type === 'an organisation admin') {
        expect(result1.statusCode).toBe(200)
        expect(result1.json().affected).toBe(1)
      } else {
        expect(result1.statusCode).toBe(403)
      }

      const result2 = await app.inject({
        method: 'PUT',
        url: `/teams/${team.id}/rewards/${rewards[4].id}`,
        headers: getHeaders(),
        payload: {
          ...payload,
          name: payload.name + ' 2',
          imageId: imageId2
        }
      })

      if (type === 'a superadmin' || type === 'a team admin') {
        expect(result2.statusCode).toBe(200)
        expect(result2.json().affected).toBe(1)
      } else {
        expect(result2.statusCode).toBe(403)
      }

      const result3 = await app.inject({
        method: 'PUT',
        url: `/rewards/${rewards[0].id}`,
        headers: getHeaders(),
        payload: {
          ...payload,
          name: payload.name + ' 3',
          imageId: imageId3
        }
      })

      if (type === 'a superadmin') {
        expect(result3.statusCode).toBe(200)
        expect(result3.json().affected).toBe(1)
      } else {
        expect(result3.statusCode).toBe(403)
      }
    }
  )

  testAll(
    `DELETE /rewards (200, 403) Deleting rewards`,
    async (type, getHeaders) => {
      if (type === 'a team admin') {
        const result = await app.inject({
          method: 'DELETE',
          url: `/organisations/${organisation.id}/rewards/${rewards[3].id}`,
          headers: getHeaders()
        })
        expect(result.statusCode).toBe(403)
      }

      if (type === 'an organisation admin') {
        const result = await app.inject({
          method: 'DELETE',
          url: `/organisations/${organisation.id}/rewards/${rewards[3].id}`,
          headers: getHeaders()
        })
        expect(result.statusCode).toBe(200)
        expect(result.json().affected).toBe(1)
      }

      if (type === 'a team admin') {
        const result = await app.inject({
          method: 'DELETE',
          url: `/teams/${team.id}/rewards/${rewards[4].id}`,
          headers: getHeaders()
        })
        expect(result.statusCode).toBe(200)
        expect(result.json().affected).toBe(1)
      }

      if (type === 'an authenticated user') {
        const result = await app.inject({
          method: 'DELETE',
          url: `/rewards/${rewards[1].id}`,
          headers: getHeaders()
        })
        expect(result.statusCode).toBe(403)
      }

      if (type === 'a superadmin') {
        const result = await app.inject({
          method: 'DELETE',
          url: `/rewards/${rewards[0].id}`,
          headers: getHeaders()
        })
        expect(result.statusCode).toBe(200)
        expect(result.json().affected).toBe(1)
      }
    }
  )

  it(`POST /rewards/:rewardId/redeem (200) A user can redeem a reward if they have sufficient points, and points are subtracted`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/rewards/${rewards[5].id}/redeem`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().id).toBeDefined()
    expect(result.json().code).toBeDefined()
    expect(result.json().redeem_url).toBeDefined()

    const me = await app.inject({
      method: 'GET',
      url: `/me`,
      headers: authHeaders
    })

    // Expect points to be reduced
    expect(me.json().points_total).toEqual(150)

    const result2 = await app.inject({
      method: 'GET',
      url: `/rewards/${rewards[5].id}`,
      headers: authHeaders
    })

    // Expect reward to show as redeemed
    expect(result2.json().redeemed).toBe(true)
  })

  it(`POST /rewards/:rewardId/redeem (200) A user cannot redeem a reward they have already redeemed`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/rewards/${rewards[6].id}/redeem`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(200)

    const result2 = await app.inject({
      method: 'POST',
      url: `/rewards/${rewards[6].id}/redeem`,
      headers: authHeaders
    })

    expect(result2.statusCode).toBe(400)
    expect(result2.json().message).toContain('already redeemed')
  })

  it(`POST /rewards/:rewardId/redeem (200) A user cannot redeem a reward if they have insufficient points`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/rewards/${rewards[7].id}/redeem`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message).toContain('insufficient points')
  })

  it(`POST /rewards/:rewardId/redeem (200) A user cannot redeem a reward if the reward is not available`, async () => {
    const reward = (
      await RewardsSetup('Test Reward', 1, {
        limit_units: true,
        units_available: 0,
        redeemed_count: 0
      })
    )[0]

    const result = await app.inject({
      method: 'POST',
      url: `/rewards/${reward.id}/redeem`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message).toContain('no longer available')
  })

  it('GET /rewards (200) A user can see which rewards they have redeemed in the list', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: authHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(result.statusCode).toBe(200)
    expect(
      result.json().results.filter((e) => e.redeemed === true).length
    ).toBeGreaterThan(0)
    expect(
      result.json().results.filter((e) => e.redeemed === false).length
    ).toBeGreaterThan(0)
  })

  it(`GET /rewards (200) Rewards can be filtered (by expired)`, async () => {
    await RewardsSetup('Test Rewards', 1, {
      reward_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
    })

    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: authHeaders,
      query: {
        expired: 'true'
      }
    })

    const results = result.json().results
    expect(results.length).toBeGreaterThan(0)
    expect(
      results.filter(
        (e) => new Date(e.reward_expires_at) < startOfDay(new Date())
      ).length
    ).toBe(results.length)
  })

  it(`GET /rewards (200) Rewards can be filtered (by locked)`, async () => {
    await RewardsSetup('Test Rewards', 1, {
      points_required: 1000000
    })

    const result = await app.inject({
      method: 'GET',
      url: `/rewards`,
      headers: authHeaders,
      query: {
        locked: 'true'
      }
    })

    const results = result.json().results

    expect(results.length).toBeGreaterThan(0)
    expect(
      results.filter((e) => e.points_required > users[0].points_total).length
    ).toBe(results.length)
  })

  it('GET /rewards (200) A user can see all their redeemed rewards', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/me/rewards`,
      headers: authHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().results.length).toBeGreaterThan(0)
  })

  it('GET /me/next-reward (200) A user can see their next unlockable reward', async () => {
    ;(
      await RewardsSetup('Test Rewards', 1, {
        points_required: 7
      })
    )[0]

    // Set points on user
    await app.get(Connection).getRepository(User).update(users[0].id, {
      points_total: 5
    })

    const result = await app.inject({
      method: 'GET',
      url: `/me/next-reward`,
      headers: authHeaders
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().reward.points_required).toBe(7)
    expect(result.json().points_until_reward).toBe(2)
  })

  it.only(`Tests that when a reward is claimed a feed entry is created`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/rewards/${rewards[8].id}/redeem`,
      headers: authHeaders
    })

    const feedItem = await getConnection()
      .getRepository(FeedItem)
      .findOne({
        where: {
          category: FeedItemCategory.MyUpdates,
          type: FeedItemType.RewardClaimed,
          reward: {
            id: rewards[8].id
          }
        },
        relations: ['reward']
      })
    expect(feedItem.id).toBeDefined()
    expect(feedItem.category).toBe('my_updates')
    expect(feedItem.type).toBe('reward_claimed')
    expect(feedItem.reward.name).toBe(rewards[8].name)
  })
})

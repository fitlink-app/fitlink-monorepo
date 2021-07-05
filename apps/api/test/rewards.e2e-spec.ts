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
import { Connection } from 'typeorm'
import {
  Reward,
  RewardAccess
} from '../src/modules/rewards/entities/reward.entity'
import { RewardsSetup, RewardsTeardown } from './seeds/rewards.seed'

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
    rewards = await RewardsSetup('Test Rewards', 6)

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
})
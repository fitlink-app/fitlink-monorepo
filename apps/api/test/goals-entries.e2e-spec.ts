import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { useSeeding } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { mockApp } from './helpers/app'
import { GoalsEntry } from '../src/modules/goals-entries/entities/goals-entry.entity'
import { GoalsEntriesModule } from '../src/modules/goals-entries/goals-entries.module'
import { getAuthHeaders } from './helpers/auth'
import { RecreateGoalsEntryDto } from '../src/modules/goals-entries/dto/update-goals-entry.dto'
import {
  GoalsEntriesSetup,
  GoalsEntriesTeardown
} from './seeds/goals-entries.seed'
import { startOfDay } from 'date-fns'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { User } from '../src/modules/users/entities/user.entity'
import { BfitDistributionSenderService } from '../src/modules/bfit/bfit-producer.service'
import { BfitDistributionService } from '../src/modules/bfit/bfit.service'

describe('GoalsEntries', () => {
  let app: NestFastifyApplication
  let seed: GoalsEntry[]
  let data: Partial<GoalsEntry & { userId: string }>[]
  let seedOtherUser: User

  beforeAll(async () => {
    app = await mockApp({
      imports: [GoalsEntriesModule],
      providers: []
    })

    try {
      app.get(BfitDistributionSenderService).sendToQueue = jest.fn();
      app.get(BfitDistributionService).handleMessage = jest.fn();
    } catch (e) {
      console.log(e);
    }

    /** Load seeded data */
    await useSeeding()
    seed = await GoalsEntriesSetup('Test Goal Entry')
    data = seed.map((each) => {
      return {
        userId: each.user.id,

        current_mindfulness_minutes: 45,
        current_steps: 10000,
        current_floors_climbed: 5,
        current_water_litres: 1,
        current_sleep_hours: 7,
        current_active_minutes: 45
      }
    })

    const others = await UsersSetup('Test Goal Entry Empty User', 1)
    seedOtherUser = others[0]
  })

  afterAll(async () => {
    await GoalsEntriesTeardown('Test Goal Entry')
    await UsersTeardown('Test Goal Entry Empty User')
    await app.get(Connection).close()
    await app.close()
  })

  it(`/POST (201) Trying to update goals entry with no data should result in 201 created`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)

    const result = await app.inject({
      method: 'POST',
      url: `/me/goals`,
      headers: userAuthHeaders
    })

    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

  it(`/POST (201) Trying to update goals entry with complete "current_" data should result in 201 created`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)
    const payload = {
      current_mindfulness_minutes: userData.current_mindfulness_minutes,
      current_steps: userData.current_steps,
      current_floors_climbed: userData.target_floors_climbed,
      current_water_litres: userData.current_water_litres,
      current_sleep_hours: userData.current_sleep_hours,
      current_active_minutes: userData.current_active_minutes
    } as RecreateGoalsEntryDto

    const result = await app.inject({
      method: 'POST',
      url: `/me/goals`,
      headers: userAuthHeaders,
      payload
    })

    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

  it(`/POST (201) Trying to update goals entry with part "current_" data should result in 201 (partial fields are allowed)`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)
    const payload = {
      current_mindfulness_minutes: userData.current_mindfulness_minutes,
      current_steps: userData.current_steps,
      current_floors_climbed: userData.current_floors_climbed
    } as RecreateGoalsEntryDto

    const result = await app.inject({
      method: 'POST',
      url: `/me/goals`,
      headers: userAuthHeaders,
      payload
    })

    expect(result.statusCode).toEqual(201)
  })

  it("GET /me/goals (200) Should get today's goal entries", async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)

    const result = await app.inject({
      method: 'GET',
      url: `/me/goals`,
      headers: userAuthHeaders
    })

    const json = result.json()

    expect(result.statusCode).toEqual(200)
    expect(startOfDay(new Date(json.created_at))).toEqual(
      startOfDay(new Date())
    )
  })

  it("GET /me/goals (200) Should get self-user's goal entries history", async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)

    const result = await app.inject({
      method: 'GET',
      url: `/me/goals/history`,
      headers: userAuthHeaders
    })

    const json = result.json()

    expect(result.statusCode).toEqual(200)
    expect(json.results.length).toBeGreaterThan(0)
  })

  it("GET /user/:userId/goals (200) Should get another user's goal entries as placeholder data", async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)

    const result = await app.inject({
      method: 'GET',
      url: `/users/${seedOtherUser.id}/goals`,
      headers: userAuthHeaders
    })

    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(json.created_at).toBeUndefined()
    expect(json.user).toBeUndefined()
    expect(json.target_mindfulness_minutes).toEqual(0)
    expect(json.current_mindfulness_minutes).toEqual(0)
  })

  it("GET /user/:userId/goals (200) Should get another user's goal entries history", async () => {
    const user1 = data.pop()
    const userAuthHeaders = getAuthHeaders({}, user1.userId)
    const user2 = data.pop()

    const result = await app.inject({
      method: 'GET',
      url: `/users/${user2.userId}/goals/history`,
      headers: userAuthHeaders
    })

    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(json.results.length).toBeGreaterThan(0)
    expect(json.results[0].user).toBeUndefined()
  })
})

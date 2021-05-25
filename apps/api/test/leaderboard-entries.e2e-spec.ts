import { mockApp } from './helpers/app'
import { LeaderboardEntriesModule } from '../src/modules/leaderboard-entries/leaderboard-entries.module'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { LeaderboardEntry } from '../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { useSeeding } from 'typeorm-seeding'
import {
  LeaderboardEntriesSetup,
  LeaderboardEntriesTeardown
} from './seeds/leaderboard-entries.seed'

describe('LeaderboardEntries', () => {
  let app: NestFastifyApplication
  let seed: LeaderboardEntry[]
  let data: LeaderboardEntry

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaderboardEntriesModule],
      providers: [],
      controllers: []
    })

    /** Load seeded data */
    await useSeeding()
    seed = (await LeaderboardEntriesSetup('Test Leaderboard Entry')).map(
      (e) => {
        // These fields aren't in use yet in the API (due to Firebase legacy)
        delete e.leaderboard
        delete e.user
        return e
      }
    )
    data = seed.map((each) => {
      return {
        leaderboard_id: each.leaderboard_id,
        user_id: each.user_id,
        league_id: each.league_id,
        points: 0
      } as LeaderboardEntry
    })[0]
  })

  afterAll(async () => {
    await LeaderboardEntriesTeardown('Test Leaderboard Entry')
    await app.close()
  })

  const headers = {
    authorization: 'Bearer fitlinkLeaderboardEntryToken'
  }

  it(`/GET  (403) leaderboard-entries/:leaderboardId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}`
    })
    expect(result.statusCode).toEqual(403)
    expect(result.statusMessage).toContain('Forbidden')
  })

  it(`/GET  (200) leaderboard-entries/:leaderboardId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}`,
      headers,
      query: {
        page: '0',
        limit: '5'
      }
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0]).sort()).toEqual(
      Object.keys(seed[0]).sort()
    )
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => value.leaderboard_id === data.leaderboard_id)
        .length
    )

    const resultPage1 = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}`,
      headers,
      query: {
        page: '1',
        limit: '5'
      }
    })

    const resultPage1Json = resultPage1.json()

    const ids = json.results.map((e) => e.id)
    const ids2 = resultPage1Json.results.map((e) => e.id)

    // Ensure that none of the data overlaps
    ids2.forEach((id) => {
      expect(ids.indexOf(id)).toEqual(-1)
    })

    // Ensure that the appropriate results were included
    expect(ids.length).toEqual(ids2.length)
  })

  it(`/GET  (200) leaderboard-entries/:leaderboardId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}?user=${data.user_id}`,
      headers
    })
    const json = result.json()
    expect(json.rank.user).toBeDefined()
    expect(json.rank.flanks).toBeDefined()
  })

  it(`/GET  (200) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}/${data.user_id}`,
      headers
    })
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(result.json()).sort()).toEqual(
      Object.keys(seed[0]).sort()
    )
  })

  it(`/GET  (404) leaderboard-entries/:leaderboardId/:userId `, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/unknown/unknown`,
      headers
    })
    expect(result.statusCode).toEqual(404)
    expect(result.json().message).toEqual(
      'No leaderboard entry found for the given userId'
    )
  })

  // TODO: Need to formulate seeds to get consistent data to test with
  it(`/GET  (200) leaderboard-entries/rank/:userId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/rank/${data.user_id}`,
      headers
    })

    expect(result.statusCode).toEqual(200)
  })

  // Trying to create an entry without complete data should result in a 400 error
  it(`/POST (400) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const payload: LeaderboardEntry = {
      ...data,
      league_id: null
    }
    const result = await app.inject({
      method: 'POST',
      url: `/leaderboard-entries`,
      headers,
      payload
    })
    expect(result.statusCode).toEqual(400)
    expect(result.statusMessage).toEqual('Bad Request')
    expect(result.json().message).toContain('league_id must be a string')
  })

  // Trying to create an entry with complete data should result in 201 created
  it(`/POST (201) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/leaderboard-entries`,
      headers,
      payload: data
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

  // Trying to update an entry should result in 200
  it(`/PUT  (200) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: `/leaderboard-entries/${data.leaderboard_id}/${data.user_id}`,
      headers,
      payload: data
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
    expect(Object.keys(json).sort()).toEqual(Object.keys(seed[0]).sort())
  })

  // Trying to delete an entry should result in 200
  it(`/DEL  (200) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const result = await app.inject({
      method: 'DELETE',
      url: `/leaderboard-entries/${data.leaderboard_id}/${data.user_id}`,
      headers
    })
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
  })
})

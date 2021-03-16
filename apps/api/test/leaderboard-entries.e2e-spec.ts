import { mockApp } from './helpers/app'
import { LeaderboardEntriesModule } from '../src/modules/leaderboard-entries/leaderboard-entries.module'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { LeaderboardEntry } from '../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { Connection, getConnection, Repository } from 'typeorm'

describe('LeaderboardEntries', () => {
  let app: NestFastifyApplication
  let seed: LeaderboardEntry[]
  let connection: Connection
  let leaderboardEntryRepository: Repository<LeaderboardEntry>
  let data: LeaderboardEntry

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaderboardEntriesModule],
      providers: [],
      controllers: []
    })

    /** Load seeded data */
    connection = getConnection()
    leaderboardEntryRepository = connection.getRepository(LeaderboardEntry)
    seed = await leaderboardEntryRepository.find()
    data = seed.map((each) => {
      return {
        leaderboard_id: each.leaderboard_id,
        user_id: each.user_id,
        league_id: each.league_id,
        points: 0
      } as LeaderboardEntry
    })[0]
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
      headers
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0])).toEqual(Object.keys(seed[0]))
    expect(json.page_total).toEqual(seed.length > 10 ? 10 : seed.length)
    expect(json.total).toEqual(
      seed.filter((value) => value.leaderboard_id === data.leaderboard_id)
        .length
    )
  })

  it(`/GET  (200) leaderboard-entries/:leaderboardId/:userId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/leaderboard-entries/${data.leaderboard_id}/${data.user_id}`,
      headers
    })
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(result.json())).toEqual(Object.keys(seed[0]))
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
    expect(Object.keys(json)).toEqual(Object.keys(seed[0]))
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

  afterAll(async () => {
    await app.close()
  })
})

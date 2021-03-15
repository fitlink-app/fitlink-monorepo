import { mockApp } from './helpers/app'
import { LeaderboardEntriesModule } from '../src/modules/leaderboard-entries/leaderboard-entries.module'

describe('LeaderboardEntries', () => {
  let app

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaderboardEntriesModule],
      providers: [],
      controllers: []
    })
  })

  const headers = {
    authorization: 'Bearer fitlinkLeaderboardEntryToken'
  }

  // Without a token, API returns 403
  it(`/GET  (403) leaderboard-entries/:leaderboardId`, () => {
    const data = [
      {
        leaderboard_id: 'ABCD',
        user_id: '1234',
        points: 0
      }
    ]

    return app
      .inject({
        method: 'GET',
        url: '/leaderboard-entries/ABCD'
      })
      .then((result) => {
        expect(result.statusCode).toEqual(403)
        expect(result.statusMessage).toContain('Forbidden')
      })
  })

  // Accessing leaderboards by ID returns array of results with pagination structure
  it(`/GET  (200) leaderboard-entries/:leaderboardId`, () => {
    const data = [
      {
        leaderboard_id: 'ABCD',
        user_id: '1234',
        points: 0
      }
    ]

    return app
      .inject({
        method: 'GET',
        url: '/leaderboard-entries/ABCD',
        headers
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200)
        expect(result.json()).toEqual({
          results: data,
          page_total: 1,
          total: 1
        })
      })
  })

  // Trying to access a single leaderboard by ID should return
  it(`/GET  (200) leaderboard-entries/:leaderboardId/:userId`, () => {
    const data = {
      leaderboard_id: 'ABCD',
      user_id: '1234',
      points: 0
    }

    return app
      .inject({
        method: 'GET',
        url: `/leaderboard-entries/${data.leaderboard_id}/${data.user_id}`,
        headers
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200)
        expect(result.json()).toEqual(data)
      })
  })

  it(`/GET  (404) leaderboard-entries/:leaderboardId/:userId `, () => {
    return app
      .inject({
        method: 'GET',
        url: `/leaderboard-entries/abc/xyz`,
        headers
      })
      .then((result) => {
        expect(result.statusCode).toEqual(404)
        expect(result.json().message).toEqual(
          'No leaderboard entry found for the given userId'
        )
      })
  })

  // Trying to create an entry without complete data should result in a 400 error
  it(`/POST (400) leaderboard-entries/:leaderboardId/:userId`, () => {
    const payload = {
      leaderboard_id: 'ABCD',
      user_id: '1234',
      points: 0
    }

    return app
      .inject({
        method: 'POST',
        url: `/leaderboard-entries`,
        headers,
        payload
      })
      .then((result) => {
        expect(result.statusCode).toEqual(400)
        expect(result.statusMessage).toEqual('Bad Request')
        expect(result.json().message).toContain('league_id must be a string')
      })
  })

  // Trying to create an entry with complete data should result in 201 created
  it(`/POST (201) leaderboard-entries/:leaderboardId/:userId`, () => {
    const payload = {
      leaderboard_id: 'ABCD',
      user_id: '1234',
      league_id: '1234',
      points: 0
    }

    return app
      .inject({
        method: 'POST',
        url: `/leaderboard-entries`,
        headers,
        payload
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        expect(result.statusMessage).toEqual('Created')
      })
  })

  // Trying to update an entry should result in 200
  it(`/PUT  (200) leaderboard-entries/:leaderboardId/:userId`, () => {
    const payload = {
      leaderboard_id: 'ABCD',
      user_id: '1234',
      league_id: '1234',
      points: 0
    }

    return app
      .inject({
        method: 'PUT',
        url: `/leaderboard-entries/${payload.leaderboard_id}/${payload.user_id}`,
        headers,
        payload
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200)
        expect(result.statusMessage).toEqual('OK')
        expect(result.json()).toEqual(payload)
      })
  })

  // Trying to delete an entry should result in 200
  it(`/DEL  (200) leaderboard-entries/:leaderboardId/:userId`, () => {
    const payload = {
      leaderboard_id: 'ABCD',
      user_id: '1234',
      league_id: '1234',
      points: 0
    }

    return app
      .inject({
        method: 'DELETE',
        url: `/leaderboard-entries/${payload.leaderboard_id}/${payload.user_id}`,
        headers
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200)
        expect(result.statusMessage).toEqual('OK')
      })
  })

  afterAll(async () => {
    await app.close()
  })
})

import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Following } from '../src/modules/followings/entities/following.entity'
import { Connection, getConnection, Repository } from 'typeorm'
import { FollowingsModule } from '../src/modules/followings/followings.module'

describe('Followings', () => {
  let app: NestFastifyApplication
  let seed: Following[]
  let connection: Connection
  let followingRepository: Repository<Following>
  let data: Following

  beforeAll(async () => {
    app = await mockApp({
      imports: [FollowingsModule],
      providers: [],
      controllers: []
    })

    /** Load seeded data */
    connection = getConnection()
    followingRepository = connection.getRepository(Following)
    seed = await followingRepository.find()
    data = seed.map((each) => {
      return ({
        follower: each.follower,
        following: each.following,
        } as unknown) as Following
    })[0]
  })

  const headers = {
    authorization: 'Bearer fitlinkLeaderboardEntryToken'
  }

  // Getting following entities with all user's followings, returns array of results with pagination structure
  it(`/GET  (200) follower/:followerId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/followings/follower/${data.follower.id}`,
      headers
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0])).toEqual(Object.keys(seed[0]))
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => value.follower === data.follower)
        .length
    )
  })

  // Getting following entities with all user's followers, returns array of results with pagination structure
  it(`/GET  (200) following/:followingId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/followings/follower/${data.following.id}`,
      headers
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0])).toEqual(Object.keys(seed[0]))
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => value.following === data.following)
        .length
    )
  })

  // Without a token, API returns 403
  it(`/GET  (403) followings/follower/:followerId/following/:followingId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/followings/follower/${data.follower.id}/following/${data.following.id}`
    })
    expect(result.statusCode).toEqual(403)
    expect(result.statusMessage).toContain('Forbidden')
  })

  // Get single following entity for follower and following
  it(`/GET  (200) followings/follower/:followerId/following/:followingId`, async () => {
    const result = await app.inject({
        method: 'GET',
        url: `/followings/follower/${data.follower.id}/following/${data.following.id}`,
        headers
      })
      expect(result.statusCode).toEqual(200)
      expect(Object.keys(result.json())).toEqual(Object.keys(seed[0]))
  })

  // Get single following entity for following and follower
  it(`/GET  (200) followings/following/:followingId/follower/:followerId`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/followings/following/${data.following.id}/follower/${data.follower.id}`,
      headers
    })
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(result.json())).toEqual(Object.keys(seed[0]))
  })

  // Trying to access a nonexistent following entity by followingId and followerId
  it(`/GET  (404) following/:followingId/follower/:followerId`, async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/followings/following/unknown/unknown/`,
        headers
      })
      expect(result.statusCode).toEqual(404)

  })

  // Trying to create a following entry with complete data should result in 201 created
  it(`/POST (201) follower/:followerId/following/:followingId`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/followings`,
      headers,
      payload: {
        followerId: data.follower.id,
        followingId: data.following.id
      }
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

    // Trying to create a following entry without complete data should result in a 400 error
    it(`/POST (400) follower/:followerId/following/:followingId`, async () => {
      const result = await app.inject({
        method: 'POST',
        url: `/followings`,
        headers,
        payload: {
          followerId: data.follower.id,
          followingId: null
        }
      })
      expect(result.statusCode).toEqual(400)
      expect(result.statusMessage).toEqual('Bad Request')
    })

  // Trying to update a following entry should result in 200
  it(`/PUT  (200) follower/:followerId/following/:followingId`, async() => {
    const result = await app.inject({
      method: 'PUT',
      url: `/followings/follower/${data.follower.id}/following/${data.following.id}`,
      headers,
      payload: {
        followerId: data.follower.id,
        followingId: data.following.id
      }
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
    expect(Object.keys(json)).toEqual(Object.keys(seed[0]))
  })

  it(`/PUT  (200) following/:followingId/follower/:followerId`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: `/followings/following/${data.following.id}/follower/${data.follower.id}`,
      headers,
      payload: {
        followerId: data.follower.id,
        followingId: data.following.id
      }
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
    expect(Object.keys(json)).toEqual(Object.keys(seed[0]))
  })

  it(`/DEL  (200) following/:followingId/follower/:followerId`, async () => {
    const result = await app.inject({
      method: 'DELETE',
      url: `/followings`,
      headers,
      payload: {
        followerId: data.follower.id,
        followingId: data.following.id
      }
    })
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
  })

  afterAll(async () => {
    await app.close()
  })
})

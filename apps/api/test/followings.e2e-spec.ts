import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Following } from '../src/modules/followings/entities/following.entity'
import { Connection, getConnection, Repository } from 'typeorm'
import { FollowingsModule } from '../src/modules/followings/followings.module'
import { getAuthHeaders } from './helpers/auth'
import { UpdateFollowingDto } from '../src/modules/followings/dto/update-following.dto'
import { CreateFollowingDto } from '../src/modules/followings/dto/create-following.dto'

describe('Followings', () => {
  let app: NestFastifyApplication
  let seed: Following[]
  let connection: Connection
  let followingRepository: Repository<Following>
  let data

  beforeAll(async () => {
    app = await mockApp({
      imports: [FollowingsModule],
      providers: [],
    })

    /** Load seeded data */
    connection = getConnection()
    followingRepository = connection.getRepository(Following)
    seed = await followingRepository.find()
    data = seed.map((each) => {
      return ({
        user: each.follower,
        target: each.following
      })
    })
  })

  // Getting following entities with all user's followings, returns array of results with pagination structure
  it(`/GET  (200) `, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({ spr: true }, userData.user.id)
    const result = await app.inject({
      method: 'GET',
      url: `/followings`,
      headers: userAuthHeaders
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0])).toEqual(Object.keys(seed[0]))
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => {
        return value.follower.id === userData.user.id
       })
       .length
    )
  })

  // Getting following entities with all user's followers, returns array of results with pagination structure
  it(`/GET  (200) followers`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({ spr: true }, userData.user.id)
    const result = await app.inject({
      method: 'GET',
      url: `/followings/followers`,
      headers: userAuthHeaders,
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0])).toEqual(Object.keys(seed[0]))
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => {
         return value.following.id === userData.user.id
        })
        .length
    )
  })


  // Trying to create a following entry with complete data should result in 201 created
  it(`/POST (201) `, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({ spr: true }, userData.user.id)
    const  payload = {
      targetId: userData.target.id
    } as CreateFollowingDto
    const result = await app.inject({
      method: 'POST',
      url: `/followings`,
      headers: userAuthHeaders,
      payload
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

    // Trying to create a following entry without complete data should result in a 400 error
    it(`/POST (400) `, async () => {
      const userData = data.pop()
      const userAuthHeaders = getAuthHeaders({ spr: true }, userData.user.id)
      const  payload = {
        targetId: null
      } as CreateFollowingDto
      const result = await app.inject({
        method: 'POST',
        url: `/followings`,
        headers: userAuthHeaders,
        payload
      })
      expect(result.statusCode).toEqual(400)
      expect(result.statusMessage).toEqual('Bad Request')
    })


  // Delete following entities. Unsubscribe from user
  it(`/DEL  (200) :targetId`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({ spr: true }, userData.user.id)
    const payload = {
      targetId: userData.user.id,
    } as UpdateFollowingDto

    const result = await app.inject({
      method: 'DELETE',
      url: `/followings/${userData.target.id}`,
      headers: userAuthHeaders,
      payload
    })
    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toEqual('OK')
  })

  afterAll(async () => {
    await app.close()
  })
})

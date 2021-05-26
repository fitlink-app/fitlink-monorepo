import { Connection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { Following } from '../src/modules/followings/entities/following.entity'
import { FollowingsModule } from '../src/modules/followings/followings.module'
import { UpdateFollowingDto } from '../src/modules/followings/dto/update-following.dto'
import { CreateFollowingDto } from '../src/modules/followings/dto/create-following.dto'
import { FollowingsSetup, FollowingsTeardown } from './seeds/followings.seed'
import { User } from '../src/modules/users/entities/user.entity'

describe('Followings', () => {
  let app: NestFastifyApplication
  let seed: Following[]
  let data: { user: User; target: User }[]

  beforeAll(async () => {
    app = await mockApp({
      imports: [FollowingsModule],
      providers: []
    })

    /** Load seeded data */
    await useSeeding()
    seed = await FollowingsSetup('Test Following')
    data = seed.map((each) => ({
      user: each.follower,
      target: each.following
    }))
  })

  afterAll(async () => {
    await FollowingsTeardown('Test Following')
    await app.get(Connection).close()
    await app.close()
  })

  // Getting following entities with all user's followings, returns array of results with pagination structure
  it(`/GET  (200) `, async () => {
    const userData = data[0]
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const result = await app.inject({
      method: 'GET',
      url: `/followings`,
      headers: userAuthHeaders
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0]).sort()).toEqual(
      Object.keys(seed[0]).sort()
    )
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => {
        return value.follower.id === userData.user.id
      }).length
    )
  })

  // Getting following entities with all user's followers, returns array of results with pagination structure
  it(`/GET  (200) followers`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const result = await app.inject({
      method: 'GET',
      url: `/followings/followers`,
      headers: userAuthHeaders
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0]).sort()).toEqual(
      Object.keys(seed[0]).sort()
    )
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => {
        return value.following.id === userData.user.id
      }).length
    )
  })

  // Trying to create a following entry with complete data should result in 201 created
  it(`/POST (201) `, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
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

  // Trying to create a following entry with user id = target id should result in a 400 error
  it(`/POST (400) `, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
      targetId: userData.user.id
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

  // Trying to create a following entry without complete data should result in a 400 error
  it(`/POST (400) `, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
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
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
      targetId: userData.user.id
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
})

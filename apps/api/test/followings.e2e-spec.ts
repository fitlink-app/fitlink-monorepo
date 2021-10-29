import { Connection, getConnection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { Following } from '../src/modules/followings/entities/following.entity'
import { FollowingsModule } from '../src/modules/followings/followings.module'
import { CreateFollowingDto } from '../src/modules/followings/dto/create-following.dto'
import { FollowingsSetup, FollowingsTeardown } from './seeds/followings.seed'
import { User } from '../src/modules/users/entities/user.entity'
import { FeedItem } from '../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedItemCategory,
  FeedItemType
} from '../src/modules/feed-items/feed-items.constants'

describe('Followings', () => {
  let app: NestFastifyApplication
  let seed: Following[]
  let data: { user: User; target: User }[]
  let user: string

  // This is the UserPublic model
  const expected = Object.keys({
    id: 1,
    name: 1,
    points_total: 1,
    followers_total: 1,
    goal_percentage: 1,
    following_total: 1,
    following: 1,
    invited: 1,
    follower: 1,
    avatar: 1
  }).sort()

  beforeAll(async () => {
    app = await mockApp({
      imports: [FollowingsModule],
      providers: []
    })

    /** Load seeded data */
    await useSeeding()
    seed = await FollowingsSetup('Test Following')
    user = seed[0].follower.id

    // Shift one item off as we're ignoring the first user
    seed.shift()

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

  it(`GET /me/following 200 A user can get all the users they are following`, async () => {
    const userData = data[0]
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const result = await app.inject({
      method: 'GET',
      url: `/me/following`,
      headers: userAuthHeaders
    })
    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0]).sort()).toEqual(expected)
    expect(json.page_total).toBeGreaterThanOrEqual(1)
    expect(json.total).toEqual(
      seed.filter((value) => {
        return value.follower.id === userData.user.id
      }).length
    )
  })

  it(`GET /me/followers 200 A user can get their followers`, async () => {
    const userAuthHeaders = getAuthHeaders({}, user)
    const result = await app.inject({
      method: 'GET',
      url: `/me/followers`,
      headers: userAuthHeaders
    })
    const json = result.json()

    expect(result.statusCode).toEqual(200)
    expect(Object.keys(json.results[0]).sort()).toEqual(expected)

    // All returned items are followers
    expect(json.results.filter((e) => e.follower === true).length).toBe(
      json.results.length
    )

    // 1 item returned is a following
    expect(json.results.filter((e) => e.following === true).length).toBe(1)

    expect(json.page_total).toBeGreaterThan(1)

    expect(seed.filter((v) => v.following.id === user).length).toEqual(
      json.total
    )
  })

  it(`POST /me/following 201 A user can follow another user`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
      targetId: userData.target.id
    } as CreateFollowingDto

    const result = await app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: userAuthHeaders,
      payload
    })
    expect(result.statusCode).toEqual(201)

    const me = await app.inject({
      method: 'GET',
      url: '/me',
      headers: userAuthHeaders
    })

    expect(me.json().following_total).toBeGreaterThanOrEqual(1)

    const target = await app.inject({
      method: 'GET',
      url: `/users/${userData.target.id}`,
      headers: userAuthHeaders
    })

    expect(target.json().following).toBe(true)
  })

  it(`POST /me/following 201 A user can be followed by another user`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const userHeaders = getAuthHeaders({}, user)
    const payload = {
      targetId: userData.user.id
    } as CreateFollowingDto

    const result = await app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: userHeaders,
      payload
    })

    expect(result.statusCode).toEqual(201)

    const me = await app.inject({
      method: 'GET',
      url: '/me',
      headers: userAuthHeaders
    })

    expect(me.json().followers_total).toBe(1)

    const target = await app.inject({
      method: 'GET',
      url: `/users/${userData.target.id}`,
      headers: userAuthHeaders
    })

    expect(target.json().follower).toBe(true)
  })

  it(`POST /me/following 400 A user cannot follow themselves`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
      targetId: userData.user.id
    } as CreateFollowingDto
    const result = await app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: userAuthHeaders,
      payload
    })
    expect(result.statusCode).toEqual(400)
  })

  it(`POST /me/following 400 Validation`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)
    const payload = {
      targetId: null
    } as CreateFollowingDto
    const result = await app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: userAuthHeaders,
      payload
    })
    expect(result.statusCode).toEqual(400)
    expect(result.json().errors.targetId).toContain('is required')
  })

  it(`DELETE /me/following/:userId A user can unfollow a user they follow and counts are updated`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.user.id)

    const followings = (
      await app.inject({
        method: 'GET',
        url: `/me/following`,
        headers: userAuthHeaders,
        query: {
          limit: '100'
        }
      })
    ).json().results

    // Get the current total users followed.
    const total = (await getMe(userAuthHeaders)).following_total
    const userToUnfollow = followings[0].id

    const result = await app.inject({
      method: 'DELETE',
      url: `/me/following/${userToUnfollow}`,
      headers: userAuthHeaders
    })

    expect(result.statusCode).toEqual(200)

    const followingsAfter = (
      await app.inject({
        method: 'GET',
        url: `/me/following`,
        headers: userAuthHeaders,
        query: {
          limit: '100'
        }
      })
    ).json().results

    // Expect that the followed user no longer exists in followings
    expect(followingsAfter.filter((f) => f.id === userToUnfollow).length).toBe(
      0
    )

    // Expect that the user's following total changed by 1
    const newTotal = (await getMe(userAuthHeaders)).following_total
    expect(newTotal).toBe(total - 1)
  })

  it(`DELETE /me/following/:userId A user's counts are updated when another user unfollows them`, async () => {
    const userAuthHeaders = getAuthHeaders({}, user)

    const followers = (
      await app.inject({
        method: 'GET',
        url: `/me/followers`,
        headers: userAuthHeaders,
        query: {
          limit: '100'
        }
      })
    ).json().results

    // Get the current total users that are following.
    const total = (await getMe(userAuthHeaders)).followers_total
    const userWillUnfollow = followers[0].id

    const result = await app.inject({
      method: 'DELETE',
      url: `/me/following/${user}`,
      headers: getAuthHeaders({}, userWillUnfollow)
    })

    expect(result.statusCode).toEqual(200)

    const followersAfter = (
      await app.inject({
        method: 'GET',
        url: `/me/followers`,
        headers: userAuthHeaders,
        query: {
          limit: '100'
        }
      })
    ).json().results

    // Expect that the followed user no longer exists in followings
    expect(followersAfter.filter((f) => f.id === userWillUnfollow).length).toBe(
      0
    )

    // Expect that the user's following total changed by 1
    const newTotal = (await getMe(userAuthHeaders)).followers_total
    expect(newTotal).toBe(total - 1)
  })

  async function getMe(userAuthHeaders) {
    const me = await app.inject({
      method: 'GET',
      url: '/me',
      headers: userAuthHeaders
    })

    return me.json()
  }

  it(`Testing new follower triggers feed entry creation`, async () => {
    const userData = data.pop()
    const userHeaders = getAuthHeaders({}, user)
    const payload = {
      targetId: userData.user.id
    } as CreateFollowingDto

    await app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: userHeaders,
      payload
    })

    const feedItem = await getConnection()
      .getRepository(FeedItem)
      .findOne({
        where: {
          user: userData.user,
          type: FeedItemType.NewFollower,
          category: FeedItemCategory.MyUpdates,
          related_user: { id: user }
        },
        relations: ['related_user']
      })

    expect(feedItem).toBeDefined()
    expect(feedItem.type).toBe(FeedItemType.NewFollower)
    expect(feedItem.category).toBe(FeedItemCategory.MyUpdates)
    expect(feedItem.related_user.id).toBe(user)
  })
})

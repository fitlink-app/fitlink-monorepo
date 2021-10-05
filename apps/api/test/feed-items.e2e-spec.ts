import { Connection, getConnection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { Following } from '../src/modules/followings/entities/following.entity'
import { CreateFollowingDto } from '../src/modules/followings/dto/create-following.dto'
import { FollowingsSetup, FollowingsTeardown } from './seeds/followings.seed'
import { User } from '../src/modules/users/entities/user.entity'
import { FeedItem } from '../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedItemCategory,
  FeedItemType
} from '../src/modules/feed-items/feed-items.constants'
import { FeedItemsModule } from '../src/modules/feed-items/feed-items.module'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { FeedItemsSetup, FeedItemsTeardown } from './seeds/feed-items.seed'
import { UsersModule } from '../src/modules/users/users.module'
import { AuthModule } from '../src/modules/auth/auth.module'
import { NotificationsModule } from '../src/modules/notifications/notifications.module'

describe('FeedItems', () => {
  let app: NestFastifyApplication
  let users: User[]
  let authHeaders: NodeJS.Dict<string>
  let authHeaders2: NodeJS.Dict<string>

  beforeAll(async () => {
    app = await mockApp({
      imports: [UsersModule, AuthModule, FeedItemsModule, NotificationsModule],
      providers: []
    })

    /** Load seeded data */
    await useSeeding()
    users = await FeedItemsSetup('Test Feed Items')
    authHeaders = getAuthHeaders({}, users[0].id)
    authHeaders2 = getAuthHeaders({}, users[1].id)
  })

  afterAll(async () => {
    await FeedItemsTeardown('Test Feed Items')
    await app.get(Connection).close()
    await app.close()
  })

  it(`GET /me/feed 200 A user can get all their feed items`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/me/feed`,
      headers: authHeaders,
      query: {
        my_updates: '1'
      }
    })

    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(json.results.length).toBeGreaterThanOrEqual(1)
    expect(json.page_total).toBeGreaterThanOrEqual(1)
  })

  it(`GET /users/:userId/feed 200 A user can get another user's feed items, depending on their privacy`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/users/${users[1].id}/feed`,
      headers: authHeaders
    })

    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(json.results.length).toBeGreaterThanOrEqual(0)
  })

  it(`GET /users/:userId/feed 200 A user can delete their own feed item`, async () => {
    const feed = (
      await app.inject({
        method: 'GET',
        url: `/me/feed`,
        headers: authHeaders,
        query: {
          my_updates: '1'
        }
      })
    ).json()

    const result = await app.inject({
      method: 'DELETE',
      url: `/me/feed/${feed.results[0].id}`,
      headers: authHeaders
    })

    const json = result.json()
    expect(result.statusCode).toEqual(200)
    expect(json.affected).toBe(1)
  })
})

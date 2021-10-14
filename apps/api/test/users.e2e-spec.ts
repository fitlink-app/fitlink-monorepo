import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { readFile } from 'fs/promises'
import { AuthModule } from '../src/modules/auth/auth.module'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import FormData = require('form-data')
import { ImagesModule } from '../src/modules/images/images.module'
import { FollowingsSetup } from './seeds/followings.seed'
import { emailHasContent, getEmailContent } from './helpers/mocking'

describe('Users', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let userRepository: Repository<User>
  let userAuthHeaders: NodeJS.Dict<string>
  let user: User
  let otherUser: User

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule, ImagesModule],
      providers: [],
      controllers: []
    })

    connection = getConnection()
    userRepository = connection.getRepository(User)

    // Seed the user and use in tests
    await useSeeding()
    const users = await UsersSetup('Test Users Unique Name')
    user = users[0]
    userAuthHeaders = getAuthHeaders({}, users[0].id)
    otherUser = users[1]
  })

  afterAll(async () => {
    await UsersTeardown('Test Users')
    await app.close()
  })

  it(`GET /users/search?q=term 200 Searches for users`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/users/search',
      query: {
        q: 'unique'
      },
      headers: userAuthHeaders
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().results.length).toBeGreaterThan(0)
  })

  it(`GET /users/search?q=term 200 Searches for users and can see followed status`, async () => {
    const unique = Date.now()
    const followings = await FollowingsSetup(
      `Test Users ${unique} Follow Name`,
      2
    )

    const beingFollowedAuthHeaders = getAuthHeaders(
      {},
      followings[0].following.id
    )
    const followerId = followings[0].follower.id
    const followingId = followings[1].following.id

    const result = await app.inject({
      method: 'GET',
      url: '/users/search',
      query: {
        q: `${unique}`,
        limit: '100'
      },
      headers: beingFollowedAuthHeaders
    })

    result.json().results.map((user) => {
      if (user.id === followerId) {
        expect(user.follower).toBe(true)
      }
      if (user.id === followingId) {
        expect(user.following).toBe(true)
      }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().results.length).toBe(1)
  })

  it(`GET /users/:userId 200 Gets another user and sees only their public profile data`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/users/${otherUser.id}`,
      headers: userAuthHeaders
    })
    expect(result.statusCode).toEqual(200)
    expect(Object.keys(result.json())).toEqual(
      expect.arrayContaining(
        Object.keys({
          followers_total: 1,
          id: 1,
          name: 1,
          points_total: 1,
          following: 1,
          follower: 1
        })
      )
    )

    expect(result.json().email).toBeUndefined()
    expect(result.json().password).toBeUndefined()
  })

  it(`PUT /me 200 Updates self-user's data`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: `/me`,
      headers: userAuthHeaders,
      payload: {
        name: 'Updated name',
        unit_system: 'imperial',
        timezone: 'Europe/London'
      }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().affected).toEqual(1)
  })

  it(`PUT /me 400 Fails to update with invalid data and shows error messages`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: `/me`,
      headers: userAuthHeaders,
      payload: {
        name: 'Updated name',
        unit_system: 'meters',
        timezone: 100000000000000
      }
    })

    expect(result.statusCode).toEqual(400)
    expect(result.json().errors.unit_system).toContain('metric or imperial')
    expect(result.json().errors.timezone).toContain('valid timezone')
  })

  it(`PUT /me/avatar 200 Allows the self-user to set their avatar using image service`, async () => {
    const form = new FormData()
    const file1 = await readFile(__dirname + '/assets/1200x1200.png')
    form.append('image', file1)
    form.append('type', 'avatar')

    const upload = await app.inject({
      method: 'POST',
      url: `/images`,
      headers: {
        ...userAuthHeaders,
        ...form.getHeaders()
      },
      payload: form
    })

    const result = await app.inject({
      method: 'PUT',
      url: `/me/avatar`,
      headers: userAuthHeaders,
      payload: {
        imageId: upload.json().id
      }
    })

    const me = await app.inject({
      method: 'GET',
      url: `/me`,
      headers: userAuthHeaders
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().affected).toEqual(1)
    expect(me.json().avatar.id).toEqual(upload.json().id)
    expect(me.json().avatar.url).toEqual(upload.json().url)
  })

  it(`PUT /me/email 200 Allows the self-user to update their email, which triggers email verification flow`, async () => {
    const email = `test-email-reset-${user.id}@example.com`
    const result = await app.inject({
      method: 'PUT',
      url: `/me/email`,
      headers: userAuthHeaders,
      payload: { email }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().affected).toEqual(1)
    expect(await emailHasContent(email)).toBe(true)

    const emails = await getEmailContent()
    const emailData = emails.filter((each) => {
      return each.toAddresses.includes(email)
    })

    const query = emailData[0].data.EMAIL_VERIFICATION_LINK.split('?token=')
    const verify = await app.inject({
      method: 'POST',
      url: `/users/verify-email`,
      payload: { token: query[1] }
    })

    expect(verify.statusCode).toEqual(200)
    expect(verify.json().affected).toEqual(1)
  })

  it(`PUT /me/password 200 Allows the self-user to update their password, provided they give their current password correctly`, async () => {
    const email = `test-email-reset-${user.id}@example.com`
    const result = await app.inject({
      method: 'PUT',
      url: `/me/password`,
      headers: userAuthHeaders,
      payload: {
        current_password: 'password',
        new_password: 'newpassword'
      }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().affected).toEqual(1)

    const auth = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: email,
        password: 'newpassword'
      }
    })

    expect(auth.statusCode).toEqual(201)
    expect(auth.json()).toMatchObject({
      id_token: expect.anything(),
      access_token: expect.anything(),
      refresh_token: expect.anything()
    })
  })
})

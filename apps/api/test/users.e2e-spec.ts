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

describe('Users', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let userRepository: Repository<User>
  let userAuthHeaders: NodeJS.Dict<string>
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
          points_total: 1
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
        timezone: 'Something/Wrong'
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
})

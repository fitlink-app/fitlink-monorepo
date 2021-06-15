import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { AuthModule } from '../src/modules/auth/auth.module'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'

describe('Users', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let userRepository: Repository<User>
  let userAuthHeaders: NodeJS.Dict<string>

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule],
      providers: [],
      controllers: []
    })

    connection = getConnection()
    userRepository = connection.getRepository(User)

    // Seed the user and use in tests
    await useSeeding()
    const users = await UsersSetup('Test Users Unique Name')
    userAuthHeaders = getAuthHeaders({}, users[0].id)
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
})

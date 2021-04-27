const date = new Date()

import mockdate from 'mockdate'
mockdate.set(date)

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { AuthModule } from '../src/modules/auth/auth.module'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import UserWithRolesSeed, { DeleteUserWithRolesSeed } from './seeds/user.seed'

describe('Users', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let userRepository: Repository<User>
  let user_email = ''
  let user_password = 'passwordIsATerriblePassword'

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule],
      providers: [],
      controllers: []
    })

    connection = getConnection()
    userRepository = connection.getRepository(User)
    await useSeeding()
    await runSeeder(UserWithRolesSeed)
    const user = await userRepository.findOne(
      { name: 'TestUser4' },
      { relations: ['roles'] }
    )
    user_email = user.email
  })

  it('Passes', () => {
    expect(1).toBe(1)
  })

  it('LOGIN', async () => {
    const data = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: user_email,
        password: user_password
      }
    })
    console.log(data.json())
  })
  afterAll(async () => {
    await useSeeding()
    await runSeeder(DeleteUserWithRolesSeed)
    await app.close()
  })
})

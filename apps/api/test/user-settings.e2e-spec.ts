import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { useSeeding, runSeeder } from 'typeorm-seeding'
import {
  PrivacySetting,
  UsersSetting
} from '../src/modules/users-settings/entities/users-setting.entity'
import { UsersSettingsModule } from '../src/modules/users-settings/users-settings.module'
import { User } from '../src/modules/users/entities/user.entity'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import {
  DeleteUserSeeder,
  DeleteUserWithSettingsSeeder,
  UserSeeder,
  UserWithSettingsSeeder
} from './seeds/user.seed'

describe('User Settings', () => {
  let app: NestFastifyApplication
  let authHeaders
  let connection: Connection
  let userRepository: Repository<User>
  let seeded_user: User

  beforeAll(async () => {
    app = await mockApp({
      imports: [UsersSettingsModule],
      providers: []
    })

    connection = getConnection()
    userRepository = connection.getRepository(User)

    await useSeeding()
    await runSeeder(UserWithSettingsSeeder)

    const user = await userRepository.findOne({
      where: { name: `User Settings` },
      relations: ['settings']
    })
    seeded_user = user

    authHeaders = getAuthHeaders(null, seeded_user.id)
  })

  afterAll(async () => {
    await useSeeding()
    await runSeeder(DeleteUserWithSettingsSeeder)
    await app.close()
  })

  it('GET /users-settings/userId', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/users-settings/${seeded_user.id}`,
      headers: authHeaders
    })

    expect(data.statusMessage).toBe('OK')
    expect(data.statusCode).toBe(200)
    expect(data.json().privacy_daily_statistics).toBeDefined()
    expect(data.json().privacy_activities).toBeDefined()
    expect(data.json().id).toBeDefined()
  })

  it('POST /users-settings/:userId', async () => {
    await useSeeding()
    await runSeeder(UserSeeder)
    const user = await userRepository.findOne({
      where: { name: 'Seeded User' }
    })
    const data = await createUserSettings(user)

    expect(data.statusMessage).toBe('Created')
    expect(data.statusCode).toBe(201)
    expect(data.json().privacy_daily_statistics).toBeDefined()
    expect(data.json().privacy_activities).toBeDefined()
    expect(data.json().id).toBeDefined()
    await runSeeder(DeleteUserSeeder)
  })

  it('PUT /users-settings/:userId', async () => {
    const payload: Partial<UsersSetting> = {
      privacy_activities: PrivacySetting.Following,
      privacy_daily_statistics: PrivacySetting.Public,
      newsletter_subscriptions_user: true
    }
    const data = await app.inject({
      method: 'PUT',
      url: `/users-settings/${seeded_user.id}`,
      headers: authHeaders,
      payload
    })

    expect(data.statusMessage).toBe('OK')
    expect(data.statusCode).toBe(200)
    expect(data.json().privacy_daily_statistics).toBeDefined()
    expect(data.json().privacy_activities).toBeDefined()
    expect(data.json().newsletter_subscriptions_user).toBeDefined()
  })

  it('DELETE /users-settings/:userId', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/users-settings/${seeded_user.id}`,
      headers: authHeaders
    })

    expect(data.statusMessage).toBe('OK')
    expect(data.statusCode).toBe(200)
  })

  async function createUserSettings(user: User) {
    const payload = {
      privacy_activities: PrivacySetting.Public,
      privacy_daily_statistics: PrivacySetting.Private
    }
    const data = await app.inject({
      method: 'POST',
      url: `/users-settings/${user.id}`,
      headers: getAuthHeaders(null, user.id),
      payload
    })
    return data
  }
})

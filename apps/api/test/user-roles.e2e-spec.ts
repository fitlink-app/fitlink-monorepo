import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection } from 'typeorm'
import { UserRolesModule } from '../src/modules/user-roles/user-roles.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'

describe('User Roles', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let authHeader

  beforeAll(async () => {
    app = await mockApp({
      imports: [UserRolesModule],
      providers: [],
      controllers: []
    })

    authHeader = getAuthHeaders()
    connection = getConnection()
  })
  /**
   * edae4e3b-fafa-46ff-ab69-6219b8fd3842
   */
  it('GET /user-roles/users/:id', async () => {
    const data = await app.inject({
      headers: authHeader,
      url: '/user-roles/users/edae4e3b-fafa-46ff-ab69-6219b8fd3842',
      method: 'GET'
    })
    console.log(data.json())
  })

  afterAll(async () => {
    await app.close()
  })
})

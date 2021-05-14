const date = new Date()

import mockdate from 'mockdate'
mockdate.set(date)

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { AuthModule } from '../src/modules/auth/auth.module'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'

// Inspect this token at https://jwt.io/
const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJmaXRsaW5rLmNvbSIsImlzcyI6ImZpdGxpbmsuY29tIiwic3ViIjoiMTFhOWYxNzQtMDg2NS00MGU1LThmM2UtMWI2NDQwNTIwMGM4IiwiaWF0IjoxNjE1NTgwMTExNjU1LCJyb2xlcyI6eyJvX2EiOlsiMzk4NzIzODcyMzk4NTcyNDAiXSwidF9hIjpbIjM5ODcyMzg3MjM5ODU3MjM5Il0sInNfYSI6dHJ1ZX0sImV4cCI6MTAxNTU4MDExNTI1NX0.eNJIV7D6NFE8s3uOa5No3XgQmXBEMB9QNybE97qkTnk`

describe('Auth', () => {
  let app: NestFastifyApplication
  let seed: User[]
  let connection: Connection
  let userRepository: Repository<User>

  // Credentials
  let userId = ''
  let email = ''
  const password = 'password'

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule],
      providers: [],
      controllers: []
    })

    /** Load seeded data */
    connection = getConnection()
    userRepository = connection.getRepository(User)
    seed = await userRepository.find()

    // Set credentials
    userId = seed[0].id
    email = seed[0].email
  })

  it(`POST /auth/login 401 Does not allow a user to login with incorrect password`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email,
        password: password + 'wrong'
      }
    })
    expect(result.statusCode).toEqual(401)
    expect(result.statusMessage).toContain('Unauthorized')
  })

  it(`POST /auth/login 401 Does not allow a user to login when they don't exist`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'none@example.com',
        password
      }
    })

    expect(result.statusCode).toEqual(401)
    expect(result.statusMessage).toContain('Unauthorized')
  })

  it(`/auth/login 201 Allows a user to login with the correct credentials`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email,
        password
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json()).toMatchObject({
      id_token: expect.anything(),
      access_token: expect.anything(),
      refresh_token: expect.anything()
    })
  })

  it(`/me 200 Allows a user to access a JWT guarded controller with a valid access token`, async () => {
    const { access_token } = await getLoginTokens(app, email, password)
    const result = await app.inject({
      method: 'GET',
      url: '/me',
      headers: {
        authorization: `Bearer ${access_token}`
      },
      payload: {
        email,
        password
      }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json()).toMatchObject({
      id: expect.anything(),
      email
    })
  })

  it(`/users/:id 200 Allows a user to access another resource with a JWT token and appropriate permissions`, async () => {
    const { access_token } = await getLoginTokens(app, email, password)
    const result = await app.inject({
      method: 'GET',
      url: `/users/${userId}`,
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })

    expect(result.statusCode).toEqual(200)
  })

  it(`/user/:id 401 Does not allow a user to access a JWT guarded controller with an invalid access token`, async () => {
    const { access_token } = await getLoginTokens(app, email, password)

    const result = await app.inject({
      method: 'GET',
      url: `/users/${userId}`,
      headers: {
        authorization: `Bearer 123${access_token}`
      }
    })

    expect(result.statusCode).toEqual(401)
    expect(result.statusMessage).toEqual('Unauthorized')
  })

  it(`/user/:id 401 Does not allow a user to access a JWT guarded controller with an expired access token`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/users/${userId}`,
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    })

    expect(result.statusCode).toEqual(401)
    expect(result.statusMessage).toEqual('Unauthorized')
  })

  afterAll(async () => {
    await app.close()
  })
})

async function getLoginTokens(app, email: string, password: string) {
  const result = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      email,
      password
    }
  })
  return result.json()
}

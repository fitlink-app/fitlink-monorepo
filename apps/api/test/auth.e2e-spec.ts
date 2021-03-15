import { AuthModule } from '../src/modules/auth/auth.module'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'

const email = 'test@example.com'
const password = 'password'
const userId = '11a9f174-0865-40e5-8f3e-1b64405200c8'
const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJmaXRsaW5rLmNvbSIsImlzcyI6ImZpdGxpbmsuY29tIiwic3ViIjoiMTFhOWYxNzQtMDg2NS00MGU1LThmM2UtMWI2NDQwNTIwMGM4IiwiaWF0IjoxNjE1NTgwMTExNjU1LCJyb2xlcyI6eyJvX2EiOlsiMzk4NzIzODcyMzk4NTcyNDAiXSwidF9hIjpbIjM5ODcyMzg3MjM5ODU3MjM5Il0sInNfYSI6dHJ1ZX0sImV4cCI6MTAxNTU4MDExNTI1NX0.eNJIV7D6NFE8s3uOa5No3XgQmXBEMB9QNybE97qkTnk`
// const passwordHashed = "$2a$10$SxsiyEPj2gjEgufzMiWTWuej0Cld6IzPT/59.0.Y6xSEosQ856u6m"

describe('Auth', () => {
  let app

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule],
      providers: [],
      controllers: []
    })
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

  it(`/auth/login 401 Allows a user to login with the correct credentials`, async () => {
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

  it(`/auth/me 200 Allows a user to access a JWT guarded controller with a valid access token`, async () => {
    const { access_token } = await getLoginTokens(app)
    const result = await app.inject({
      method: 'GET',
      url: '/auth/me',
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
    const { access_token } = await getLoginTokens(app)
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
    const { access_token } = await getLoginTokens(app)

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

  describe('Auth - Access token expiration', () => {
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
  })

  afterAll(async () => {
    await app.close()
  })
})

async function getLoginTokens(app) {
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

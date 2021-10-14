import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection } from 'typeorm'
import { AuthModule } from '../src/modules/auth/auth.module'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { useSeeding } from 'typeorm-seeding'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { emailHasContent, timeout } from './helpers/mocking'
import { createTokenFromPayload } from './helpers/auth'
import { AuthService } from '../src/modules/auth/auth.service'
import { AuthProviderType } from '../src/modules/auth/auth.constants'

// Inspect this token at https://jwt.io/
const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJmaXRsaW5rLmNvbSIsImlzcyI6ImZpdGxpbmsuY29tIiwic3ViIjoiMTFhOWYxNzQtMDg2NS00MGU1LThmM2UtMWI2NDQwNTIwMGM4IiwiaWF0IjoxNjE1NTgwMTExNjU1LCJyb2xlcyI6eyJvX2EiOlsiMzk4NzIzODcyMzk4NTcyNDAiXSwidF9hIjpbIjM5ODcyMzg3MjM5ODU3MjM5Il0sInNfYSI6dHJ1ZX0sImV4cCI6MTAxNTU4MDExNTI1NX0.eNJIV7D6NFE8s3uOa5No3XgQmXBEMB9QNybE97qkTnk`

const providerEmail = Date.now() + '@fitlinkapp.com'

describe('Auth', () => {
  let app: NestFastifyApplication

  // Credentials
  let userId = ''
  let email = ''
  let name = ''
  const password = 'password'
  let passwordToken

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, UsersModule],
      providers: [],
      controllers: []
    })

    // Seed the user and use in tests
    await useSeeding()
    const users = await UsersSetup('Auth User', 1)

    // Set credentials
    userId = users[0].id
    email = users[0].email
    name = users[0].name

    // Create password reset token
    passwordToken = createTokenFromPayload({
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: email,
      iat: new Date().getTime()
    })
  })

  afterAll(async () => {
    await UsersTeardown('Auth User')
    await app.get(Connection).close()
    await app.close()
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

  it(`/auth/login 201 Allows a user to sign up with only an email address and password`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: Date.now() + '-email@example.com',
        password: 'password'
      }
    })

    const json = result.json()

    expect(result.statusCode).toEqual(201)
    expect(json.auth).toMatchObject({
      id_token: expect.anything(),
      access_token: expect.anything(),
      refresh_token: expect.anything()
    })
    expect(json.me.id).toBeDefined()
  })

  it(`/auth/login 400 Fails for weak password`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: Date.now() + '-email@example.com',
        password: 'pass'
      }
    })

    const json = result.json()
    expect(result.statusCode).toEqual(400)
    expect(json.errors['password']).toContain('must be at least')
  })

  it(`/auth/request-password-reset 200 Allows user to receive a reset password email with link`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/auth/request-password-reset',
      payload: {
        email
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(await emailHasContent(email)).toBe(true)
  })

  it(`/auth/reset-password 400 Bad request when user tries reset their password with a bad token`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: '/auth/reset-password',
      payload: {
        password: 'password',
        token: '123'
      }
    })

    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toContain('Invalid token')
  })

  it(`/auth/reset-password 200 User can reset their password with a valid reset token (originates from email)`, async () => {
    const result = await app.inject({
      method: 'PUT',
      url: '/auth/reset-password',
      payload: {
        password: 'password',
        token: passwordToken
      }
    })

    expect(result.statusCode).toEqual(200)
    expect(result.json().affected).toBe(1)
  })

  it(`/auth/reset-password 400 Bad request when user tries to reset their password with the token that is issued before their last password reset date`, async () => {
    const passwordToken1 = createTokenFromPayload({
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: email,
      iat: new Date().getTime()
    })

    await timeout(1000)

    await app.inject({
      method: 'PUT',
      url: '/auth/reset-password',
      payload: {
        password: 'password',
        token: passwordToken1
      }
    })

    await timeout(1000)

    const result = await app.inject({
      method: 'PUT',
      url: '/auth/reset-password',
      payload: {
        password: 'password',
        token: passwordToken1
      }
    })

    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toContain('already reset your password')
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
      url: `/me`,
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })

    const data = result.json()

    expect(data.created_at).toBeDefined()
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
      url: `/me`,
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    })

    expect(result.statusCode).toEqual(401)
    expect(result.statusMessage).toEqual('Unauthorized')
  })

  it(`POST /auth/connect 400 Does not proceed with invalid auth provider`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: `/auth/connect`,
      payload: {
        token: 'google_token',
        provider: 'facebook.com'
      }
    })

    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toContain('Validation failed')
    expect(result.json().errors.provider).toContain('google.com')
  })

  it(`POST /auth/connect 201 Allows a new signup with the provider`, async () => {
    const authService = app.get(AuthService)

    authService.verifyProviderGoogle = jest.fn(() => {
      return Promise.resolve({
        email: providerEmail,
        display_name: 'Test Google Provider',
        photo_url: 'https://example.com/image',
        raw_id: '123',
        type: AuthProviderType.Google
      })
    })

    const result = await app.inject({
      method: 'POST',
      url: `/auth/connect`,
      payload: {
        token: 'google_token',
        provider: 'google.com'
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json().me).toBeDefined()
    expect(result.json().me.email).toEqual(providerEmail)
    expect(result.json().me.name).toEqual('Test Google Provider')
    expect(result.json().me.avatar.url).toEqual('https://example.com/image')
    expect(result.json().auth).toBeDefined()
  })

  it(`POST /auth/connect 201 Allows an association with the provider`, async () => {
    const authService = app.get(AuthService)

    authService.verifyProviderGoogle = jest.fn(() => {
      return Promise.resolve({
        email: providerEmail,
        display_name: 'Test Apple Provider',
        raw_id: '123',
        type: AuthProviderType.Apple
      })
    })

    const result = await app.inject({
      method: 'POST',
      url: `/auth/connect`,
      payload: {
        token: 'google_token',
        provider: 'google.com'
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json().me).toBeDefined()
    expect(result.json().me.email).toEqual(providerEmail)

    // Still uses the first provider name and image
    expect(result.json().me.name).toEqual('Test Google Provider')
    expect(result.json().me.avatar.url).toEqual('https://example.com/image')
    expect(result.json().auth).toBeDefined()
  })

  it(`POST /auth/connect 201 Allows an association with the provider from a password-based user`, async () => {
    const authService = app.get(AuthService)

    authService.verifyProviderGoogle = jest.fn(() => {
      return Promise.resolve({
        email: email,
        display_name: 'Test Apple Provider',
        raw_id: '123',
        type: AuthProviderType.Apple
      })
    })

    const result = await app.inject({
      method: 'POST',
      url: `/auth/connect`,
      payload: {
        token: 'google_token',
        provider: 'google.com'
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json().me).toBeDefined()
    expect(result.json().me.email).toEqual(email)
    expect(result.json().me.name).toEqual(name)
    expect(result.json().me.avatar).toBe(null)
    expect(result.json().auth).toBeDefined()
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

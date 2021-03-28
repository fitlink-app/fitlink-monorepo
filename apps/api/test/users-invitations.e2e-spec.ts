import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { JwtService } from '@nestjs/jwt'
import { getConnection } from 'typeorm'
import { mockApp } from './helpers/app'
import { emailHasContent } from './helpers/mocking'
import { getAuthHeaders } from './helpers/auth'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { User } from '../src/modules/users/entities/user.entity'
import { CreateUsersInvitationDto } from '../src/modules/users-invitations/dto/create-users-invitation.dto'

describe('Activities', () => {
  let app: NestFastifyApplication
  let authHeaders
  let user: User

  beforeAll(async () => {
    app = await mockApp({
      imports: [TeamsModule],
      providers: []
    })

    // Retrieve a team to test with
    user = await getUser()

    // Auth user
    authHeaders = getAuthHeaders(null, user.id)
  })

  afterAll(async () => {
    await app.close()
  })

  const testAll = test.each([['an authenticated user', () => authHeaders]])

  testAll(
    `POST /users-invitations 201 Permissions for %s to invite a user`,
    async () => {
      const data = await createInvitation()
      expect(data.statusCode).toEqual(201)

      const result = data.json()
      const { inviteLink } = result
      expect(inviteLink).toBeDefined()

      // Check email content
      // All emails are mocked to email-debug.log in jest tests
      expect(await emailHasContent(inviteLink)).toEqual(true)
    }
  )

  it('POST /users-invitations/verify Allows any anonymous user to verify a token', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/users-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(201)
    expect(result.sub).toBe(user.id)
  })

  it('POST /users-invitations/verify Throws an error when verifying a token that is invalid', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/users-invitations/verify`,
      payload: {
        token: token.split('').reverse().join('')
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.message).toContain('Token is invalid')
  })

  it('POST /users-invitations/verify Throws an error when verifying a token that is expired', async () => {
    await createInvitation()

    const jwtService = app.get(JwtService)

    // Mock an expired token
    const token = jwtService.sign({ sub: user.id }, { expiresIn: -1 })

    const data = await app.inject({
      method: 'POST',
      url: `/users-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(401)
    expect(result.message).toContain('invitation can no longer be used')
  })

  async function getUser() {
    const connection = getConnection()
    const repository = connection.getRepository(User)
    const user = await repository.findOne()
    return user
  }

  function createInvitation(
    headers = authHeaders,
    payload?: Partial<CreateUsersInvitationDto>
  ) {
    return app.inject({
      method: 'POST',
      url: `/users-invitations`,
      headers,
      payload: payload || {
        email: 'jest@example.com',
        invitee: 'Jest'
      }
    })
  }
})

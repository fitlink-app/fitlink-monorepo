import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { getConnection } from 'typeorm'
import { mockApp } from './helpers/app'
import { emailHasContent } from './helpers/mocking'
import { getAuthHeaders } from './helpers/auth'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { CreateTeamsInvitationDto } from '../src/modules/teams-invitations/dto/create-teams-invitation.dto'
import { Team } from '../src/modules/teams/entities/team.entity'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { JwtService } from '@nestjs/jwt'

describe('Activities', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let organisationAdminHeaders
  let teamAdminHeaders
  let authHeaders
  let team: Team
  let organisation: Organisation

  beforeAll(async () => {
    app = await mockApp({
      imports: [TeamsModule],
      providers: []
    })

    // Retrieve an organisation to test with
    organisation = await getOrganisation()

    // Retrieve a team to test with
    team = await getTeam(organisation)

    // Superadmin
    superadminHeaders = getAuthHeaders({ spr: true })
    // Org admin
    organisationAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
    // Team admin
    teamAdminHeaders = getAuthHeaders({ t_a: [team.id] })
    // Auth user
    authHeaders = getAuthHeaders()
  })

  afterAll(async () => {
    await app.close()
  })

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an organisation admin', () => organisationAdminHeaders],
    ['a team admin', () => teamAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testAll(
    `POST /organisations/:organisationId/teams/:teamId/invitations 201 Permissions for %s to invite a user`,
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const data = await createInvitation(
        organisation.id,
        team.id,
        getHeaders(),
        payload
      )

      if (type === 'an authenticated user') {
        expect(data.statusCode).toEqual(403)
        return
      }

      expect(data.statusCode).toEqual(201)

      const result = data.json()
      const { invitation, inviteLink } = result
      expect(invitation.team.id).toEqual(team.id)
      expect(invitation.email).toBeDefined()

      // Check email content
      // All emails are mocked to email-debug.log in jest tests
      expect(await emailHasContent(inviteLink)).toEqual(true)
    }
  )

  testAll(
    'POST /organisations/:organisationId/teams/:teamId/invitations 200 Permissions for %s to read the open invitations of a team',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      await createInvitation()

      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${organisation.id}/teams/${team.id}/invitations`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(data.statusCode).toEqual(403)
        return
      }

      const result = data.json()

      expect(Object.keys(result.results[0])).toEqual(
        expect.arrayContaining(['id', 'name', 'email', 'accepted', 'dismissed'])
      )
      expect(result.results.length).toBeGreaterThan(1)
      expect(data.statusCode).toEqual(200)
    }
  )

  testAll(
    'POST /organisations/:organisationId/teams/:teamId/invitations 200 Permissions for %s to read a single invitation of a team',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${organisation.id}/teams/${team.id}/invitations/${invitation.id}`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(data.statusCode).toEqual(403)
        return
      }

      const result = data.json()
      expect(data.statusCode).toEqual(200)
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['id', 'name', 'email', 'accepted', 'dismissed'])
      )
    }
  )

  testAll(
    'DELETE /organisations/:organisationId/teams/:teamId/invitations 200 Permissions for %s to delete a single invitation of a team',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'DELETE',
        url: `/organisations/${organisation.id}/teams/${team.id}/invitations/${invitation.id}`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(data.statusCode).toEqual(403)
        return
      }

      const result = data.json()
      expect(data.statusCode).toEqual(200)
      expect(result.affected).toEqual(1)
    }
  )

  testAll(
    'PUT /organisations/:organisationId/teams/:teamId/invitations 200 Permissions for %s to resend a single invitation of a team',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'PUT',
        url: `/organisations/${organisation.id}/teams/${team.id}/invitations/${invitation.id}`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(data.statusCode).toEqual(403)
        return
      }

      const { token, inviteLink } = data.json()

      expect(data.statusCode).toEqual(200)
      expect(token).toBeDefined()
      expect(inviteLink).toBeDefined()

      // Check email content
      // All emails are mocked to email-debug.log in jest tests
      expect(await emailHasContent(inviteLink)).toEqual(true)
    }
  )

  it('POST /teams-invitations/verify Allows any anonymous user to verify a token', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/teams-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(201)
    expect(result.accepted).toBe(false)
  })

  it('POST /teams-invitations/verify Throws an error when verifying a token that is invalid', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/teams-invitations/verify`,
      payload: {
        token: token.split('').reverse().join('')
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.message).toContain('Token is invalid')
  })

  it('POST /teams-invitations/verify Throws an error when verifying a token that is expired', async () => {
    const invitationData = await createInvitation()
    const { invitation } = invitationData.json()

    const jwtService = app.get(JwtService)

    // Mock an expired token
    const token = jwtService.sign(
      {
        sub: invitation.team.id
      },
      { expiresIn: -1 }
    )

    const data = await app.inject({
      method: 'POST',
      url: `/teams-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(401)
    expect(result.message).toContain('invitation can no longer be used')
  })

  async function getOrganisation() {
    const connection = getConnection()
    const repository = connection.getRepository(Organisation)
    return repository.findOne({
      relations: ['teams']
    })
  }

  async function getTeam(organisation: Organisation) {
    const team = organisation.teams[0]
    return team
  }

  function createInvitation(
    id = organisation.id,
    teamId = team.id,
    headers = superadminHeaders,
    payload?: Partial<CreateTeamsInvitationDto>
  ) {
    return app.inject({
      method: 'POST',
      url: `/organisations/${id}/teams/${teamId}/invitations`,
      headers,
      payload: payload || {
        email: 'jest@example.com',
        invitee: 'Jest'
      }
    })
  }
})

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { getConnection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { mockApp } from './helpers/app'
import { emailHasContent } from './helpers/mocking'
import { getAuthHeaders } from './helpers/auth'
import { OrganisationsModule } from '../src/modules/organisations/organisations.module'
import { CreateOrganisationsInvitationDto } from '../src/modules/organisations-invitations/dto/create-organisations-invitation.dto'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { JwtService } from '@nestjs/jwt'
import {
  OrganisationsSetup,
  OrganisationsTeardown
} from './seeds/organisations.seed'
import { UsersSetup } from './seeds/users.seed'

describe('Organisations Invitations', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let organisationAdminHeaders
  let authHeaders
  let organisation: Organisation

  beforeAll(async () => {
    app = await mockApp({
      imports: [OrganisationsModule],
      providers: []
    })

    await useSeeding()

    // Retrieve an organisation to test with
    const organisations = await OrganisationsSetup(
      'Test Organisation Invitation',
      1
    )
    const users = await UsersSetup('Test Organisation Invitation')

    organisation = organisations[0]
    // Superadmin
    superadminHeaders = getAuthHeaders({ spr: true }, users[0].id)
    // Org admin
    organisationAdminHeaders = getAuthHeaders(
      { o_a: [organisation.id] },
      users[0].id
    )
    // Auth user
    authHeaders = getAuthHeaders(undefined, users[0].id)
  })

  afterAll(async () => {
    await OrganisationsTeardown('Test Organisation Invitation')
    await app.close()
  })

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an organisation admin', () => organisationAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testAll(
    `POST /organisations/:organisationId/invitations 201 Permissions for %s to invite a user`,
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const data = await createInvitation(
        organisation.id,
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
      expect(invitation.organisation.id).toEqual(organisation.id)
      expect(invitation.email).toBeDefined()

      // Check email content
      // All emails are mocked to email-debug.log in jest tests
      expect(await emailHasContent(inviteLink)).toEqual(true)
    }
  )

  testAll(
    'POST /organisations/:organisationId/invitations 200 Permissions for %s to read the open invitations of an organisation',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      await createInvitation()

      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${organisation.id}/invitations`,
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
    'POST /organisations/:organisationId/invitations 200 Permissions for %s to read a single invitation of an organisation',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${organisation.id}/invitations/${invitation.id}`,
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
    'DELETE /organisations/:organisationId/invitations 200 Permissions for %s to delete a single invitation of an organisation',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'DELETE',
        url: `/organisations/${organisation.id}/invitations/${invitation.id}`,
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
    'PUT /organisations/:organisationId/invitations 200 Permissions for %s to resend a single invitation of an organisation',
    async (type, getHeaders) => {
      const payload = {
        email: 'jest@example.com',
        invitee: 'Jest'
      }

      const invitationData = await createInvitation()
      const { invitation } = invitationData.json()

      const data = await app.inject({
        method: 'PUT',
        url: `/organisations/${organisation.id}/invitations/${invitation.id}`,
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

  it('POST /organisations-invitations/verify Allows any anonymous user to verify a token', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/organisations-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(201)
    expect(result.accepted).toBe(false)
  })

  it('POST /organisations-invitations/verify Throws an error when verifying a token that is invalid', async () => {
    const invitationData = await createInvitation()
    const { token } = invitationData.json()

    const data = await app.inject({
      method: 'POST',
      url: `/organisations-invitations/verify`,
      payload: {
        token: token.split('').reverse().join('')
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.message).toContain('invitation is invalid')
  })

  it('POST /organisations-invitations/verify Throws an error when verifying a token that is expired', async () => {
    const invitationData = await createInvitation()
    const { invitation } = invitationData.json()

    const jwtService = app.get(JwtService)

    // Mock an expired token
    const token = jwtService.sign(
      {
        sub: invitation.organisation.id
      },
      { expiresIn: -1 }
    )

    const data = await app.inject({
      method: 'POST',
      url: `/organisations-invitations/verify`,
      payload: {
        token
      }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.message).toContain('invitation can no longer be used')
  })

  async function getOrganisation() {
    const connection = getConnection()
    const repository = connection.getRepository(Organisation)
    return repository.findOne()
  }

  function createInvitation(
    id = organisation.id,
    headers = superadminHeaders,
    payload?: Partial<CreateOrganisationsInvitationDto>
  ) {
    return app.inject({
      method: 'POST',
      url: `/organisations/${id}/invitations`,
      headers,
      payload: payload || {
        email: 'jest@example.com',
        invitee: 'Jest'
      }
    })
  }
})

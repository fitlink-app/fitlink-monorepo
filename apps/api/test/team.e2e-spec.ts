import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as faker from 'faker'
import { readFile } from 'fs/promises'
import { Connection, getConnection } from 'typeorm'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import FormData = require('form-data')
import { Team } from '../src/modules/teams/entities/team.entity'
import { useSeeding } from 'typeorm-seeding'
import { TeamsSetup, TeamsTeardown } from './seeds/teams.seed'

describe('Teams', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let orgAdminHeaders
  let superadminHeaders
  let organisation: Organisation
  let team: Team
  let teamAdminHeaders
  let invitationToken: string
  let authHeaders

  beforeAll(async () => {
    app = await mockApp({
      imports: [TeamsModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()
    // Get Seeded Organisations

    await useSeeding()
    const teams = await TeamsSetup('Test Teams')

    team = await connection.getRepository(Team).findOne({
      where: { id: teams[0].id },
      relations: ['users', 'organisation']
    })

    const team2 = await connection.getRepository(Team).findOne({
      where: { id: teams[1].id },
      relations: ['users', 'organisation']
    })

    const user = team2.users[0]

    superadminHeaders = getAuthHeaders({ spr: true }, user.id)

    organisation = await connection.getRepository(Organisation).findOne({
      where: { id: team.organisation.id },
      relations: ['teams']
    })

    if (organisation) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] }, user.id)
      teamAdminHeaders = getAuthHeaders({ t_a: [team.id] }, user.id)
    }

    authHeaders = getAuthHeaders(null, user.id)
    const data = await app.inject({
      method: 'POST',
      url: `/organisations/${organisation.id}/teams/${team.id}/invitations`,
      headers: superadminHeaders,
      payload: {
        email: user.email,
        invitee: user.name
      }
    })

    invitationToken = data.json().token
  })

  const testOrgAndSuperAdmin = test.each([
    ['a superadmin', () => superadminHeaders],
    ['a organisation admin', () => orgAdminHeaders]
  ])

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['a organisation admin', () => orgAdminHeaders],
    ['a team admin', () => teamAdminHeaders]
  ])

  it(`POST /teams/join`, async () => {
    const data = await app.inject({
      method: 'POST',
      url: `/teams/join`,
      headers: authHeaders,
      payload: { token: invitationToken }
    })
    expect(data.statusMessage).toBe('Created')
    expect(data.statusCode).toBe(201)
    expect(data.json().resolved_user).toBeDefined()
    expect(data.json().team).toBeDefined()
    expect(data.json().name).toBeDefined()
  })

  testAll(
    `GET /organisations/orgId/teams/teamId/users`,
    async (_, getHeaders) => {
      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${organisation.id}/teams/${team.id}/users`,
        headers: getHeaders()
      })
      expect(data.statusCode).toEqual(200)
      expect(data.statusMessage).toBe('OK')
      expect(data.json().length).toBeTruthy()
      expect(data.json()[0].email).toBeDefined()
      expect(data.json()[0].name).toBeDefined()
    }
  )

  it(`DELETE /teamId/users/userId`, async () => {
    const users = team.users
    let userId = users[0].id
    const data = await app.inject({
      method: 'DELETE',
      url: `/teams/${team.id}/users/${userId}`,
      headers: teamAdminHeaders
    })
    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toBe('OK')
  })

  testOrgAndSuperAdmin(
    `POST /organisations/orgId/teams`,
    async (_, getHeaders) => {
      const data = await createTeamWithImage(true, getHeaders())
      expect(data.statusCode).toEqual(201)
      expect(data.json().name).toBeDefined()
      expect(data.json().avatar.id).toBeDefined()
    }
  )

  testOrgAndSuperAdmin(
    `PUT /organisations/orgId/teams/teamId`,
    async (_, getHeaders) => {
      const data = await updateTeamWithImage(true, getHeaders())
      expect(data.statusCode).toEqual(200)
      expect(data.json().name).toBeDefined()
      expect(data.json().avatar.id).toBeDefined()
    }
  )

  it('GET /organisations/:organisationId/teams', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${organisation.id}/teams`,
      headers: orgAdminHeaders
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().results.length).toBeTruthy()
  })

  it(`GET /teams`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/teams',
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().results.length).toBeTruthy()
  })

  it(`GET /organisations/:organisationId/teams/:teamId`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${organisation.id}/teams/${team.id}`,
      headers: orgAdminHeaders
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().id).toBeDefined()
    expect(data.json().name).toBeDefined()
  })

  it(`GET /teams/:teamId`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${team.id}`,
      headers: superadminHeaders
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().id).toBeDefined()
    expect(data.json().name).toBeDefined()
  })

  async function updateTeamWithImage(avatar = true, headers = orgAdminHeaders) {
    const form = new FormData()
    let imageCreate: any = {}
    const payload: any = {
      name: 'Test Teams'
    }

    if (avatar) {
      const image = await readFile(__dirname + `/assets/1200x1200.png`)
      form.append('image', image)
      form.append('type', 'avatar')

      imageCreate = await app.inject({
        method: 'POST',
        url: '/images',
        payload: form,
        headers: {
          ...headers,
          ...form.getHeaders()
        }
      })

      payload.imageId = imageCreate.json().id
    }

    const data = await app.inject({
      method: 'PUT',
      url: `/organisations/${organisation.id}/teams/${team.id}`,
      payload,
      headers
    })

    return data
  }

  async function createTeamWithImage(avatar = true, headers = orgAdminHeaders) {
    const form = new FormData()
    let imageCreate: any = {}
    const payload: any = {
      name: 'Test Teams'
    }

    if (avatar) {
      const image = await readFile(__dirname + `/assets/1200x1200.png`)
      form.append('image', image)
      form.append('type', 'avatar')

      imageCreate = await app.inject({
        method: 'POST',
        url: '/images',
        payload: form,
        headers: {
          ...headers,
          ...form.getHeaders()
        }
      })

      payload.imageId = imageCreate.json().id
    }

    const data = await app.inject({
      method: 'POST',
      url: `/organisations/${organisation.id}/teams`,
      payload,
      headers
    })

    return data
  }

  afterAll(async () => {
    await TeamsTeardown('Test Teams')
    await app.close()
  })
})

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { readFile } from 'fs/promises'
import { Connection, getConnection, Repository } from 'typeorm'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { Team } from '../src/modules/teams/entities/team.entity'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import FormData = require('form-data')
import * as faker from 'faker'

describe('Teams', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let organisationRepository: Repository<Organisation>
  let orgAdminHeaders
  let superadminHeaders
  let seeded_organisation: Organisation

  beforeAll(async () => {
    app = await mockApp({
      imports: [TeamsModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()
    organisationRepository = connection.getRepository(Organisation)
    superadminHeaders = getAuthHeaders({ spr: true })
    // Get Seeded Organisations

    const organisations = await organisationRepository.find({
      relations: ['teams']
    })
    seeded_organisation = organisations[0]

    if (organisations[0]) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisations[0].id] })
    }
  })

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['a organisation admin', () => orgAdminHeaders]
  ])

  testAll(`POST /organisation/orgId/teams`, async (_, getHeaders) => {
    const data = await createTeamWithImage(true, getHeaders())
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().avatar.url).toBeDefined()
  })

  testAll(`PUT /organisation/orgId/teams/teamId`, async (_, getHeaders) => {
    const data = await updateTeamWithImage(true, getHeaders())
    expect(data.statusCode).toEqual(200)
    expect(data.json().name).toBeDefined()
    expect(data.json().avatar.url).toBeDefined()
  })

  it('GET /organisation/:organisationId/teams', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisation/${seeded_organisation.id}/teams`,
      headers: orgAdminHeaders
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().length).toBeTruthy()
  })

  it(`GET /teams`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/teams',
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().length).toBeTruthy()
  })

  it(`GET /organisation/:organisationId/teams/:teamId`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisation/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}`,
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
      url: `/teams/${seeded_organisation.teams[0].id}`,
      headers: superadminHeaders
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().id).toBeDefined()
    expect(data.json().name).toBeDefined()
  })

  async function updateTeamWithImage(avatar = true, headers = orgAdminHeaders) {
    const form = new FormData()
    const image = await readFile(__dirname + `/assets/1200x1200.png`)
    form.append('name', `Update name: ${faker.name.title()}`)
    if (avatar) {
      form.append('avatar', image)
    }

    const data = await app.inject({
      method: 'PUT',
      url: `/organisation/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}`,
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })

    return data
  }

  async function createTeamWithImage(avatar = true, headers = orgAdminHeaders) {
    const form = new FormData()
    const image = await readFile(__dirname + `/assets/900x611.png`)

    form.append('name', faker.name.title())
    if (avatar) {
      form.append('avatar', image)
    }
    const data = await app.inject({
      method: 'POST',
      url: `/organisation/${seeded_organisation.id}/teams`,
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })

    return data
  }

  afterAll(async () => {
    await app.close()
  })
})

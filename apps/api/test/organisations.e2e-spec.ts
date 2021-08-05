import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { readFile } from 'fs/promises'
import { v4 as uuid } from 'uuid'
import * as FormData from 'form-data'
import { mockApp } from './helpers/app'
import { emailHasContent } from './helpers/mocking'
import { getAuthHeaders } from './helpers/auth'
import { OrganisationsModule } from '../src/modules/organisations/organisations.module'
import { CreateOrganisationDto } from '../src/modules/organisations/dto/create-organisation.dto'
import { useSeeding } from 'typeorm-seeding'
import {
  OrganisationsSetup,
  OrganisationsTeardown
} from './seeds/organisations.seed'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { TeamsSetup } from './seeds/teams.seed'
import { Team } from '../src/modules/teams/entities/team.entity'

describe('Activities', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let authHeaders
  let teams: Team[]

  beforeAll(async () => {
    app = await mockApp({
      imports: [OrganisationsModule],
      providers: []
    })

    // Run seed
    await useSeeding()
    await OrganisationsSetup('Test organisations')

    const users = await UsersSetup('Test organisations', 1)

    teams = await TeamsSetup('Test organisations', 1)

    // Superadmin
    superadminHeaders = getAuthHeaders({ spr: true }, users[0].id)

    // Normal user
    authHeaders = getAuthHeaders({}, users[0].id)
  })

  afterAll(async () => {
    await OrganisationsTeardown('Test organisations')
    await UsersTeardown('Test organisations')
    await app.close()
  })

  it(`POST /organisations 201 Allows a superadmin to create a new organisation and email an invitation`, async () => {
    const { data, payload } = await createOrganisation(superadminHeaders)
    expect(data.statusCode).toEqual(201)

    const result = data.json()
    expect(result.organisation.id).toBeDefined()
    expect(result.organisation.name).toEqual(payload.name)
    expect(result.invitation.id).toBeDefined()

    // Check email content
    // All emails are mocked to email-debug.log in jest tests
    expect(await emailHasContent(payload.email)).toEqual(true)
  })

  it(`POST /organisations 201 Allows a superadmin to create a new organisation with an image`, async () => {
    const payload = {
      name: 'Test Organisation',
      type: 'company',
      timezone: 'Etc/GMT+2'
    } as CreateOrganisationDto

    const form = new FormData()
    const file1 = await readFile(__dirname + '/assets/1200x1200.png')

    form.append('image', file1)
    form.append('type', 'avatar')

    const upload = await app.inject({
      method: 'POST',
      url: '/images',
      headers: {
        ...form.getHeaders(),
        ...superadminHeaders
      },
      payload: form
    })

    expect(upload.statusCode).toBe(201)

    const data = await app.inject({
      method: 'POST',
      url: '/organisations',
      headers: superadminHeaders,
      payload: { ...payload, imageId: upload.json().id }
    })

    const result = data.json()
    expect(data.statusCode).toEqual(201)
    expect(result.organisation.avatar.id).toBe(upload.json().id)
  })

  it(`POST /organisations 201 Allows a superadmin to delete an organisation`, async () => {
    let { data } = await createOrganisation(superadminHeaders)
    const organisationId = data.json().organisation.id

    data = await app.inject({
      method: 'DELETE',
      url: `/organisations/${organisationId}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().affected).toEqual(1)
  })

  it(`GET /organisations/:organisationId/users 201 Allows a superadmin to get the users within an organisation`, async () => {
    const organisationId = teams[0].organisation.id

    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${organisationId}/users`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().results.length).toBeGreaterThan(0)
    expect(data.json().results[0].id).toBeDefined()
    expect(data.json().results[0].name).toBeDefined()
    expect(data.json().results[0].email).toBeUndefined()
  })

  it(`POST /organisations 400 Fails with validation errors if payload is not complete`, async () => {
    const payload = {
      name: 'Test Organisation',
      timezone: 'Etc/GMT+2'
    } as CreateOrganisationDto

    const data = await app.inject({
      method: 'POST',
      url: '/organisations',
      headers: superadminHeaders,
      payload
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.errors['type']).toContain('must be a valid enum value')
  })

  it(`POST /organisations 400 Fails with validation errors if payload contains bad timezone`, async () => {
    const payload = {
      name: 'Test Organisation',
      timezone: 'Etc/GMT+UTC',
      type: 'company'
    } as CreateOrganisationDto

    const data = await app.inject({
      method: 'POST',
      url: '/organisations',
      headers: superadminHeaders,
      payload
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.errors['timezone']).toContain('must be a valid timezone')
  })

  it(`POST /organisations 403 Does not allow an ordinary authenticated user to create an organisation`, async () => {
    const { data } = await createOrganisation(authHeaders)
    expect(data.statusCode).toEqual(403)
  })

  it(`POST /organisations 403 Does not allow an ordinary authenticated user to delete an organisation`, async () => {
    let { data } = await createOrganisation(superadminHeaders)
    const organisationId = data.json().id

    data = await app.inject({
      method: 'DELETE',
      url: `/organisations/${organisationId}`,
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(403)
  })

  async function createOrganisation(headers) {
    const payload = {
      name: 'Test Organisation',
      type: 'company',
      timezone: 'Etc/GMT+2',
      invitee: 'Test User',
      email: `test-${uuid()}@example.com`
    } as CreateOrganisationDto

    const data = await app.inject({
      method: 'POST',
      url: '/organisations',
      headers,
      payload
    })

    return {
      data: data,
      payload
    }
  }
})

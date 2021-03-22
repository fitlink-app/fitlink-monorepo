import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { readFile } from 'fs/promises'
import FormData = require('form-data')
import { OrganisationsModule } from '../src/modules/organisations/organisations.module'
import { CreateOrganisationDto } from '../src/modules/organisations/dto/create-organisation.dto'

describe('Activities', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let authHeaders

  beforeAll(async () => {
    app = await mockApp({
      imports: [OrganisationsModule],
      providers: []
    })

    // Superadmin
    superadminHeaders = getAuthHeaders({
      spr: true
    })

    // Normal user
    authHeaders = getAuthHeaders()
  })

  afterAll(async () => {
    await app.close()
  })

  it(`POST /organisations 201 Allows a superadmin to create a new organisation`, async () => {
    const { data, payload } = await createOrganisation(superadminHeaders)

    expect(data.statusCode).toEqual(201)

    const result = data.json()
    expect(result.id).toBeDefined()
    expect(result.name).toEqual(payload.name)
  })

  it(`POST /organisations 201 Allows a superadmin to create a new organisation with an image`, async () => {
    const payload = {
      name: 'My Test Organisation',
      type: 'company',
      timezone: 'Etc/GMT+2'
    } as CreateOrganisationDto

    const form = new FormData()
    const file1 = await readFile(__dirname + '/assets/1200x1200.png')

    form.append('avatar', file1)

    Object.keys(payload).map((key: string) => {
      form.append(key, payload[key])
    })

    const data = await app.inject({
      method: 'POST',
      url: '/organisations',
      headers: {
        ...form.getHeaders(),
        ...superadminHeaders
      },
      payload: form
    })

    const result = data.json()
    expect(data.statusCode).toEqual(201)
    expect(result.id).toBeDefined()
    expect(result.name).toEqual(payload.name)
    expect(result.avatar.url_128x128).toBeDefined()
  })

  it(`POST /organisations 201 Allows a superadmin to delete an organisation`, async () => {
    let { data } = await createOrganisation(superadminHeaders)
    const organisationId = data.json().id

    data = await app.inject({
      method: 'DELETE',
      url: `/organisations/${organisationId}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().affected).toEqual(1)
  })

  it(`POST /organisations 400 Fails with validation errors if payload is not complete`, async () => {
    const payload = {
      name: 'My Test Organisation',
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
    expect(result.message).toEqual(['type must be a valid enum value'])
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
      name: 'My Test Organisation',
      type: 'company',
      timezone: 'Etc/GMT+2'
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

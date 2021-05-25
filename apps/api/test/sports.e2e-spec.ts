import { mockApp } from './helpers/app'
import { SportsModule } from '../src/modules/sports/sports.module'
import { Connection } from 'typeorm'
import { Sport } from '../src/modules/sports/entities/sport.entity'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { useSeeding } from 'typeorm-seeding'
import { SportSetup, SportsTeardown } from './seeds/sport.seed'
import * as faker from 'faker'
import { getAuthHeaders } from './helpers/auth'

describe('Sports', () => {
  let app: NestFastifyApplication
  let sportID: string
  let superadminHeaders

  beforeAll(async () => {
    app = await mockApp({
      imports: [SportsModule],
      providers: []
    })

    superadminHeaders = getAuthHeaders({ spr: true })

    // Seed Sport Data
    await useSeeding()
    const sport = await SportSetup({
      name: 'Sport Test',
      name_key: 'sport_test',
      plural: 'sports',
      singular: 'sport'
    })

    sportID = sport.id
  })

  afterAll(async () => {
    await SportsTeardown('Sport Test')
    await app.get(Connection).close()
    await app.close()
  })

  it('/GET (200) /sports', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/sports',
      headers: superadminHeaders
    })

    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toContain('OK')
  })

  it('/GET (200) /sports/:id', async () => {
    const result = await app.inject({
      method: `GET`,
      url: `/sports/${sportID}`,
      headers: superadminHeaders
    })
    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toContain('OK')
  })

  it('/GET (404) /sports/:id ', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/sports/rando`,
      headers: superadminHeaders
    })

    expect(result.statusCode).toBe(404)
    expect(result.statusMessage).toBe('Not Found')
  })

  it('/POST (201) /sports', async () => {
    const payload = {
      name: faker.name.title(),
      plural: faker.name.title().toLowerCase() + 's',
      singular: faker.name.title()
    }

    const result = await app.inject({
      method: 'POST',
      url: '/sports',
      payload: payload,
      headers: superadminHeaders
    })

    expect(result.statusCode).toBe(201)
    expect(result.statusMessage).toContain('Created')
  })

  it('/POST (400) /sports ', async () => {
    const payload = {
      invalid: 'not valid',
      incomplete_data: true
    }

    const result = await app.inject({
      method: 'POST',
      url: '/sports',
      headers: superadminHeaders,
      payload
    })

    expect(result.statusCode).toBe(400)
    expect(result.statusMessage).toBe('Bad Request')
  })

  it('/PUT (200|204) /sports/:id', async () => {
    const payload: Partial<Sport> = {
      name_key: faker.name.title().toLocaleLowerCase()
    }
    const result = await app.inject({
      method: 'PUT',
      url: `/sports/${sportID}`,
      headers: superadminHeaders,
      payload
    })

    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toBe('OK')
  })

  it('/DELETE (200) /sports/:id', async () => {
    const result = await app.inject({
      method: `DELETE`,
      headers: superadminHeaders,
      url: `/sports/${sportID}`
    })
    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toContain('OK')
  })
})

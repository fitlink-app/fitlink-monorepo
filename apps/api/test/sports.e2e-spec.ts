import { mockApp } from './helpers/app'
import { SportsModule } from '../src/modules/sports/sports.module'
import { Connection, getConnection, Repository } from 'typeorm'
import { Sport } from '../src/modules/sports/entities/sport.entity'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import TestingSportsSeed, { DeleteSports } from './seeds/sport.seed'
import * as faker from 'faker'

describe('Sports', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let sportsRepository: Repository<Sport>
  let sportID: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [SportsModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()
    sportsRepository = connection.getRepository(Sport)

    // Seed Sport Data
    await useSeeding()
    await runSeeder(TestingSportsSeed)

    // Getting our seeded data by it's name cause the ID keeps changing.
    const seededData = await sportsRepository.findOne({
      where: { name: 'Swimming' }
    })
    sportID = seededData.id
  })

  it('/GET (200) /sports', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/sports'
    })

    expect(result.statusCode).toEqual(200)
    expect(result.statusMessage).toContain('OK')
  })

  it('/GET (200) /sports/:id', async () => {
    const result = await app.inject({
      method: `GET`,
      url: `/sports/${sportID}`
    })
    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toContain('OK')
  })

  it('/GET (404) /sports/:id ', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/sports/rando`
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
      payload: payload
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
      payload
    })

    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toBe('OK')
  })

  it('/DELETE (200) /sports/:id', async () => {
    const result = await app.inject({
      method: `DELETE`,
      url: `/sports/${sportID}`
    })
    expect(result.statusCode).toBe(200)
    expect(result.statusMessage).toContain('OK')

    // Run the Seeder again for future tests.
    await runSeeder(TestingSportsSeed)
  })

  afterAll(async () => {
    await runSeeder(DeleteSports)
    await app.close()
  })
})

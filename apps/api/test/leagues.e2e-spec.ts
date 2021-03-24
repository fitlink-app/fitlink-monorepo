import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { CreateLeagueDto } from '../src/modules/leagues/dto/create-league.dto'
import { League } from '../src/modules/leagues/entities/league.entity'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { Sport } from '../src/modules/sports/entities/sport.entity'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import * as faker from 'faker'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import TestingLeagueSeed, { DeleteLeagueSeed } from './seeds/leagues.seed'

describe('Leagues', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let leaguesRepository: Repository<League>
  let authHeaders
  let sportsRepository: Repository<Sport>
  let seeded_league

  let sportID: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaguesModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()

    leaguesRepository = connection.getRepository(League)
    sportsRepository = connection.getRepository(Sport)

    authHeaders = getAuthHeaders()

    const data = await sportsRepository.findOne({
      where: { name: 'Running' }
    })
    sportID = data.id

    // Use Seeder.
    await useSeeding()
    await runSeeder(TestingLeagueSeed)

    // Get Currently Seeded Data.
    const leagueSeed = await leaguesRepository.findOne({
      where: { name: 'Dying League' }
    })
    seeded_league = leagueSeed
  })

  it('GET /leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/leagues',
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
  })

  it(`GET /leagues/:id`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${seeded_league.id}`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('POST /leagues', async () => {
    const payload: CreateLeagueDto = {
      description: 'Test League Description',
      name: 'Test League',
      sportId: sportID
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload: payload
    })
    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
  })

  it('PUT /leagues/:id', async () => {
    const payload = {
      name: faker.lorem.text(2),
      description: faker.lorem.text(5)
    }
    const data = await app.inject({
      method: 'PUT',
      url: `/leagues/${seeded_league.id}`,
      headers: authHeaders,
      payload
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('DELETE /leagues/:id', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/leagues/${seeded_league.id}`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    // After we're done deleting the seeded data we need to re run it.
    await runSeeder(TestingLeagueSeed)
  })

  afterAll(async () => {
    await runSeeder(DeleteLeagueSeed)
    await app.close()
  })
})

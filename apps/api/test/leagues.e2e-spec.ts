import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as faker from 'faker'
import { Connection, getConnection, Repository } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { CreateLeagueDto } from '../src/modules/leagues/dto/create-league.dto'
import { League } from '../src/modules/leagues/entities/league.entity'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { Sport } from '../src/modules/sports/entities/sport.entity'
import { Team } from '../src/modules/teams/entities/team.entity'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import {
  LeaguesSetup,
  LeaguesTeardown,
  TeamAssignedLeagueSetup,
  TeamAssignedLeagueTeardown
} from './seeds/leagues.seed'
import { SportSetup, SportsTeardown } from './seeds/sport.seed'

describe('Leagues', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let teamAdminHeaders
  let seeded_league: League
  let seeded_team: Team
  let team_assigned_league: League
  let sportID: string
  let sportName: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaguesModule],
      providers: [],
      controllers: []
    })

    superadminHeaders = getAuthHeaders({ spr: true })

    // Use Seeder.
    await useSeeding()
    const rand = Math.random()
    sportName = 'Running League Test ' + rand
    const sport = await SportSetup({
      name: sportName,
      name_key: 'running_league_test_' + rand,
      plural: 'runs',
      singular: 'run'
    })

    const leagues = await LeaguesSetup('Test League')
    team_assigned_league = await TeamAssignedLeagueSetup('Test Team League')

    sportID = sport.id

    // Get Currently Seeded Data.
    seeded_league = leagues[0]

    // // Get the team name to use it's credentials for testing
    seeded_team = team_assigned_league.team

    // // Get the League that is already assigned to our team aka teams[0]
    if (seeded_team) {
      teamAdminHeaders = getAuthHeaders({ t_a: [seeded_team.id] })
    }
  })

  it('GET /leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/leagues',
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
    expect(data.json().results.length).toBeGreaterThan(0)
  })

  it('GET /teams/:teamId/leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${seeded_team.id}/leagues`,
      headers: teamAdminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
    expect(data.json().results.length).toBeGreaterThan(0)
  })

  it(`GET /leagues/:id`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${seeded_league.id}`,
      headers: superadminHeaders
    })

    const payload = data.json()
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(payload.id).toBeDefined()
    expect(payload.name).toBeDefined()
  })

  it(`GET /teams/teamId/leagues/:id`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders
    })

    const payload = data.json()
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(payload.id).toBeDefined()
    expect(payload.name).toBeDefined()
  })

  it('POST /leagues', async () => {
    const payload: CreateLeagueDto = {
      description: faker.name.jobDescriptor(),
      name: faker.name.jobTitle(),
      sportId: sportID
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: superadminHeaders,
      payload: payload
    })
    const parsed = data.json()
    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
    expect(parsed.league.id).toBeDefined()
    expect(parsed.league.name).toBeDefined()
    expect(parsed.league.description).toBeDefined()
  })

  it('POST /teams/:teamId/leagues', async () => {
    const payload: CreateLeagueDto = {
      description: faker.name.jobDescriptor(),
      name: faker.name.jobTitle(),
      sportId: sportID
    }
    const data = await app.inject({
      method: 'POST',
      url: `/teams/${seeded_team.id}/leagues`,
      headers: teamAdminHeaders,
      payload: payload
    })
    const parsed = data.json()
    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
    expect(parsed.league.id).toBeDefined()
    expect(parsed.league.name).toBeDefined()
    expect(parsed.league.description).toBeDefined()
  })

  it('PUT /leagues/:id', async () => {
    const payload = {
      name: `Updated Name: ${faker.lorem.text(5)}`,
      description: `Updated Description: ${faker.lorem.text(5)}`
    }
    const data = await app.inject({
      method: 'PUT',
      url: `/leagues/${seeded_league.id}`,
      headers: superadminHeaders,
      payload
    })
    const parsed = data.json()

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(parsed.id).toBeDefined()
    expect(parsed.name).toBeDefined()
    expect(parsed.description).toBeDefined()
  })

  it('PUT teams/:teamId/leagues/:id', async () => {
    const payload = {
      name: `Updated Name: ${faker.lorem.text(5)}`,
      description: `Updated Description: ${faker.lorem.text(5)}`
    }
    const data = await app.inject({
      method: 'PUT',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders,
      payload
    })
    const parsed = data.json()

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(parsed.id).toBeDefined()
    expect(parsed.name).toBeDefined()
    expect(parsed.description).toBeDefined()
  })

  it('DELETE /leagues/:id', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/leagues/${seeded_league.id}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    // After we're done deleting the seeded data we need to re run it.
    // await runSeeder(TestingLeagueSeed)
  })

  it('DELETE teams/teamId/leagues/:id', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    // After we're done deleting the seeded data we need to re run it.
    // await runSeeder(TeamAssignedLeagueSetup)
  })

  afterAll(async () => {
    await LeaguesTeardown('Test League')
    await TeamAssignedLeagueTeardown('Test Team League')
    await SportsTeardown(sportName)
    await app.close()
  })
})

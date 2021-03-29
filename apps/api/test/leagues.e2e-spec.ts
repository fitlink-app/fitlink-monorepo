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
import TestingLeagueSeed, {
  DeleteLeagueSeed,
  DeleteTeamAssignedLeague,
  TeamAssignedLeague
} from './seeds/leagues.seed'
import { Team } from '../src/modules/teams/entities/team.entity'

describe('Leagues', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let leaguesRepository: Repository<League>
  let teamRepository: Repository<Team>
  let superadminHeaders
  let teamAdminHeaders
  let sportsRepository: Repository<Sport>
  let seeded_league
  let seeded_team
  let team_assigned_league

  let sportID: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaguesModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()

    superadminHeaders = getAuthHeaders({ spr: true })

    leaguesRepository = connection.getRepository(League)
    sportsRepository = connection.getRepository(Sport)
    teamRepository = connection.getRepository(Team)

    const data = await sportsRepository.findOne({
      where: { name: 'Running' }
    })
    sportID = data.id

    // Use Seeder.
    await useSeeding()
    await runSeeder(TestingLeagueSeed)
    await runSeeder(TeamAssignedLeague)

    // Get Currently Seeded Data.
    const leagueSeed = await leaguesRepository.findOne({
      where: { name: 'Dying League' }
    })
    seeded_league = leagueSeed

    // Get the team name to use it's credentials for testing
    const teamSeed = await teamRepository.findOne({
      where: { name: 'Pouros LLC' }
    })
    seeded_team = teamSeed

    // Get the League that is already assigned to our team aka Pouros LLC
    team_assigned_league = await leaguesRepository.findOne({
      where: { name: 'Team Assigned Dying League' }
    })
    teamAdminHeaders = getAuthHeaders({ t_a: [teamSeed.id] })
  })

  it('GET /leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/leagues',
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
  })

  it('GET /teams/:teamId/leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${seeded_team.id}/leagues`,
      headers: teamAdminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
  })

  it(`GET /leagues/:id`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${seeded_league.id}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it(`GET /teams/teamId/leagues/:id`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
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
    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
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
      headers: superadminHeaders,
      payload
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('PUT team/:teamId/leagues/:id', async () => {
    const payload = {
      name: faker.lorem.text(2),
      description: faker.lorem.text(5)
    }
    const data = await app.inject({
      method: 'PUT',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders,
      payload
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
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
    await runSeeder(TestingLeagueSeed)
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
    await runSeeder(TeamAssignedLeague)
  })

  afterAll(async () => {
    await runSeeder(DeleteLeagueSeed)
    await runSeeder(DeleteTeamAssignedLeague)
    await app.close()
  })
})

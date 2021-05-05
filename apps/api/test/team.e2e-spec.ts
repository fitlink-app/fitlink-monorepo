import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as faker from 'faker'
import { readFile } from 'fs/promises'
import { Connection, getConnection, Repository } from 'typeorm'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import FormData = require('form-data')
import { User } from '../src/modules/users/entities/user.entity'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { DeleteUserSeeder, UserSeeder } from './seeds/user.seed'

describe('Teams', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let organisationRepository: Repository<Organisation>
  let userRepository: Repository<User>
  let orgAdminHeaders
  let superadminHeaders
  let seeded_organisation: Organisation
  let teamAdminHeaders
  let invitationToken: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [TeamsModule],
      providers: [],
      controllers: []
    })
    connection = getConnection()
    organisationRepository = connection.getRepository(Organisation)
    userRepository = connection.getRepository(User)
    superadminHeaders = getAuthHeaders({ spr: true })
    // Get Seeded Organisations

    const organisation = await organisationRepository
      .createQueryBuilder('organisation')
      .innerJoinAndSelect('organisation.teams', 'teams')
      .innerJoinAndSelect('teams.users', 'users')
      .where('teams.organisation.id = organisation.id')
      .getOne()

    seeded_organisation = organisation

    if (organisation) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
      teamAdminHeaders = getAuthHeaders({ t_a: [organisation.teams[0].id] })
    }

    await useSeeding()
    await runSeeder(DeleteUserSeeder)

    const users = await userRepository.find({
      where: { name: `Seeded User` },
      relations: ['teams']
    })

    // const filteredUsers = users.filter((user) => user.teams !== [])
    // let user = filteredUsers[Math.floor(Math.random() * filteredUsers.length)]

    // const data = await app.inject({
    //   method: 'POST',
    //   url: `/organisations/${organisation.id}/teams/${organisation.teams[0].id}/invitations`,
    //   headers: superadminHeaders,
    //   payload: {
    //     email: user.email,
    //     invitee: user.name
    //   }
    // })
    // invitationToken = data.json().token
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

  /**
   * You can't send more than one invitation token so the test is only for superadmins.
   */
  // it(`POST /organisations/:organisationId/teams/:teamId/join`, async () => {
  //   const data = await app.inject({
  //     method: 'POST',
  //     url: `/organisations/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}/join`,
  //     headers: superadminHeaders,
  //     payload: { token: invitationToken }
  //   })

  //   expect(data.statusMessage).toBe('Created')
  //   expect(data.statusCode).toBe(201)
  //   expect(data.json().resolved_user).toBeDefined()
  //   expect(data.json().team).toBeDefined()
  //   expect(data.json().name).toBeDefined()
  // })

  testAll(
    `GET /organisations/orgId/teams/teamId/users`,
    async (_, getHeaders) => {
      const data = await app.inject({
        method: 'GET',
        url: `/organisations/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}/users`,
        headers: getHeaders()
      })
      expect(data.statusCode).toEqual(200)
      expect(data.statusMessage).toBe('OK')
      expect(data.json().length).toBeTruthy()
      expect(data.json()[0].email).toBeDefined()
      expect(data.json()[0].name).toBeDefined()
    }
  )

  testAll(
    `DELETE /organisations/orgId/teams/teamId/users/userId`,
    async (_, getHeaders) => {
      const team = seeded_organisation.teams.find((team) => team.users !== [])
      const users = team.users
      let userId = users[Math.floor(Math.random() * users.length)].id
      const data = await app.inject({
        method: 'DELETE',
        url: `/organisations/${seeded_organisation.id}/teams/${team.id}/users/${userId}`,
        headers: getHeaders()
      })
      expect(data.statusCode).toEqual(200)
      expect(data.statusMessage).toBe('OK')
    }
  )

  testOrgAndSuperAdmin(
    `POST /organisations/orgId/teams`,
    async (_, getHeaders) => {
      const data = await createTeamWithImage(true, getHeaders())
      expect(data.statusCode).toEqual(201)
      expect(data.json().name).toBeDefined()
      expect(data.json().avatar.url).toBeDefined()
    }
  )

  testOrgAndSuperAdmin(
    `PUT /organisations/orgId/teams/teamId`,
    async (_, getHeaders) => {
      const data = await updateTeamWithImage(true, getHeaders())
      expect(data.statusCode).toEqual(200)
      expect(data.json().name).toBeDefined()
      expect(data.json().avatar.url).toBeDefined()
    }
  )

  it('GET /organisations/:organisationId/teams', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${seeded_organisation.id}/teams`,
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

  it(`GET /organisations/:organisationId/teams/:teamId`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}`,
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
      url: `/organisations/${seeded_organisation.id}/teams/${seeded_organisation.teams[0].id}`,
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
      url: `/organisations/${seeded_organisation.id}/teams`,
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

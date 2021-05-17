import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { AuthModule } from '../src/modules/auth/auth.module'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { UserRole } from '../src/modules/user-roles/entities/user-role.entity'
import { UserRolesModule } from '../src/modules/user-roles/user-roles.module'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import UserRolesSeeder from './seeds/user-roles.seed'

describe('User Roles', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let organisationRepository: Repository<Organisation>
  let userRoleRepository: Repository<UserRole>
  let authHeader
  let orgAdminHeaders
  let superadminHeaders
  let seededOrganisation: Organisation
  let seededUser
  let seeded_user_role
  let orgAdminPayload
  let teamAdminPayload
  let subAdminPayload

  beforeAll(async () => {
    app = await mockApp({
      imports: [UserRolesModule, UsersModule, AuthModule],
      providers: [],
      controllers: []
    })

    connection = getConnection()
    organisationRepository = connection.getRepository(Organisation)
    userRoleRepository = connection.getRepository(UserRole)
    superadminHeaders = getAuthHeaders({ spr: true })

    const seed = await organisationRepository.find({
      relations: ['teams', 'subscriptions']
    })

    const organisation = seed[0]
    seededOrganisation = organisation

    if (organisation) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
    }

    await useSeeding()
    const seededUserRole = await runSeeder(UserRolesSeeder)
    seeded_user_role = seededUserRole
    seededUser = seededUserRole.user
    authHeader = getAuthHeaders({}, seededUserRole.user.id)

    orgAdminPayload = {
      role: 'organisation_admin',
      organisation: seededOrganisation.id
    }
    teamAdminPayload = {
      role: 'team_admin',
      team: seededOrganisation.teams[0].id
    }
    subAdminPayload = {
      role: 'subscription_admin',
      subscription: seededOrganisation.subscriptions[0].id
    }
  })

  /**
   * This is for the different Variations of roles to test them all out
   * 1. Team Admin
   * 2. Organisation Admin
   * 3. Subscription Admin
   *  */

  const testRoles = test.each([
    ['organisation admin', () => orgAdminPayload],
    ['team admin', () => teamAdminPayload],
    ['subscription admin', () => subAdminPayload]
  ])

  it('GET /organisations/:organisationId/roles/users/:id/roles', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisations/${seededOrganisation.id}/roles/users/${seededUser.id}`,
      headers: authHeader
    })

    const result = data.json()[0]
    expect(result.id).toBeDefined()
    expect(result.role).toBeDefined()
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  testRoles(
    'POST /organisations/:organisationId/users/:userId/roles',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'POST',
        url: `/organisations/${seededOrganisation.id}/users/${seededUser.id}/roles`,
        payload: getRolePayload(),
        headers: orgAdminHeaders
      })

      expect(data.statusCode).toBe(201)
      expect(data.json().id).toBeDefined()
      expect(data.json().role).toBeDefined()
      expect(data.json().user).toBeDefined()
      /**
       * Role Related Checks
       */
      if (role === 'organisation admin') {
        expect(data.json().organisation).toBeDefined()
      }
      if (role === 'team admin') {
        expect(data.json().team).toBeDefined()
      }
      if (role === 'subscription admin') {
        expect(data.json().subscription).toBeDefined()
      }
    }
  )

  testRoles(
    'POST organisations/:organisationId/users/:userId/roles',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'POST',
        url: `/organisations/${seededOrganisation.id}/users/${seededUser.id}/roles`,
        payload: getRolePayload(),
        headers: superadminHeaders
      })

      expect(data.statusCode).toBe(201)
      expect(data.json().id).toBeDefined()
      expect(data.json().role).toBeDefined()
      expect(data.json().user).toBeDefined()
      /**
       * Role Related Checks
       */
      if (role === 'organisation admin') {
        expect(data.json().organisation).toBeDefined()
      }
      if (role === 'team admin') {
        expect(data.json().team).toBeDefined()
      }
      if (role === 'subscription admin') {
        expect(data.json().subscription).toBeDefined()
      }
    }
  )

  testRoles(
    'PUT organisations/:organisationId/users/:userId/roles/:roleId',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'PUT',
        url: `/organisations/${seededOrganisation.id}/users/${seededUser.id}/roles/${seeded_user_role.id}`,
        payload: getRolePayload(),
        headers: orgAdminHeaders
      })

      expect(data.statusCode).toBe(200)
      expect(data.json().id).toBeDefined()
      expect(data.json().role).toBeDefined()
      expect(data.json().user).toBeDefined()
      /**
       * Role Related Checks
       */
      if (role === 'organisation admin') {
        expect(data.json().organisation).toBeDefined()
      }
      if (role === 'team admin') {
        expect(data.json().team).toBeDefined()
      }
      if (role === 'subscription admin') {
        expect(data.json().subscription).toBeDefined()
      }
    }
  )

  testRoles(
    'PUT organisations/:organisationId/users/:userId/roles/:roleId',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'PUT',
        url: `/organisations/${seededOrganisation.id}/users/${seededUser.id}/roles/${seeded_user_role.id}`,
        payload: getRolePayload(),
        headers: superadminHeaders
      })

      expect(data.statusCode).toBe(200)
      expect(data.json().id).toBeDefined()
      expect(data.json().role).toBeDefined()
      expect(data.json().user).toBeDefined()
      /**
       * Role Related Checks
       */
      if (role === 'organisation admin') {
        expect(data.json().organisation).toBeDefined()
      }
      if (role === 'team admin') {
        expect(data.json().team).toBeDefined()
      }
      if (role === 'subscription admin') {
        expect(data.json().subscription).toBeDefined()
      }
    }
  )

  it('DELETE organisations/:organisationId/users/:userId/roles/:roleId', async () => {
    /**
     * A Seeder is unneccessary
     * since it's only being used once
     */
    const userRole = await userRoleRepository.save(
      userRoleRepository.create({
        role: 'team_admin',
        user: seededUser,
        team: seededOrganisation.teams[0]
      })
    )
    const data = await app.inject({
      method: 'DELETE',
      url: `/organisations/${seededOrganisation.id}/users/${seededUser.id}/roles/${userRole.id}`,
      headers: authHeader
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('POST roles/superadmin/:userId', async () => {
    /**
     * This test will need refactoring once the jwts.
     */
    const data = await app.inject({
      method: 'POST',
      url: `roles/superadmin/${seededUser}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
  })

  afterAll(async () => {
    await app.close()
  })
})

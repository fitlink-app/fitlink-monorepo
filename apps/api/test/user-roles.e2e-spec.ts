import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { AuthModule } from '../src/modules/auth/auth.module'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { UserRole } from '../src/modules/user-roles/entities/user-role.entity'
import { UserRolesModule } from '../src/modules/user-roles/user-roles.module'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'

describe('User Roles', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let organisationRepository: Repository<Organisation>
  let userRoleRepository: Repository<UserRole>
  let authHeader
  let orgAdminHeaders
  let superadminHeaders
  let seeded_organisation: Organisation
  let seeded_user
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

    const organisation = await organisationRepository
      .createQueryBuilder('organisation')
      .innerJoinAndSelect('organisation.teams', 'teams')
      .innerJoinAndSelect('organisation.subscriptions', 'subscriptions')
      .where('teams.organisation.id = organisation.id')
      .andWhere('subscriptions.organisation.id = organisation.id')
      .getOne()

    seeded_organisation = organisation

    if (organisation) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
    }

    const userRole = await userRoleRepository.findOne({ relations: ['user'] })
    seeded_user_role = userRole
    seeded_user = userRole.user
    authHeader = getAuthHeaders({}, userRole.user.id)

    orgAdminPayload = {
      role: 'organisation_admin',
      organisation: seeded_organisation.id
    }
    teamAdminPayload = {
      role: 'team_admin',
      team: seeded_organisation.teams[0].id
    }
    subAdminPayload = {
      role: 'subscription_admin',
      subscription: seeded_organisation.subscriptions[0].id
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
      url: `/organisations/${seeded_organisation.id}/roles/users/${seeded_user.id}`,
      headers: authHeader
    })

    const role = { ...seeded_user_role }
    delete role.user

    const result = data.json()[0]
    expect(Object.keys(result)).toEqual(Object.keys(role))
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  testRoles(
    'POST /organisations/:organisationId/users/:userId/roles',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'POST',
        url: `/organisations/${seeded_organisation.id}/users/${seeded_user.id}/roles`,
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
        url: `/organisations/${seeded_organisation.id}/users/${seeded_user.id}/roles`,
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
        url: `/organisations/${seeded_organisation.id}/users/${seeded_user.id}/roles/${seeded_user_role.id}`,
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
        url: `/organisations/${seeded_organisation.id}/users/${seeded_user.id}/roles/${seeded_user_role.id}`,
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
        user: seeded_user,
        team: seeded_organisation.teams[0]
      })
    )
    const data = await app.inject({
      method: 'DELETE',
      url: `/organisations/${seeded_organisation.id}/users/${seeded_user.id}/roles/${userRole.id}`,
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
      url: `roles/superadmin/${seeded_user}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
  })

  afterAll(async () => {
    await app.close()
  })
})

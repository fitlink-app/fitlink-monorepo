import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection, Repository } from 'typeorm'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { UserRole } from '../src/modules/user-roles/entities/user-role.entity'
import { UserRolesModule } from '../src/modules/user-roles/user-roles.module'
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
      imports: [UserRolesModule],
      providers: [],
      controllers: []
    })

    authHeader = getAuthHeaders()
    connection = getConnection()
    organisationRepository = connection.getRepository(Organisation)
    userRoleRepository = connection.getRepository(UserRole)
    superadminHeaders = getAuthHeaders({ spr: true })

    const organisation = await organisationRepository.findOne({
      relations: ['teams', 'subscriptions']
    })
    seeded_organisation = organisation

    if (organisation) {
      orgAdminHeaders = getAuthHeaders({ o_a: [organisation.id] })
    }

    const userRole = await userRoleRepository.findOne({ relations: ['user'] })
    seeded_user_role = userRole
    seeded_user = userRole.user

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

  it('GET /user-roles/users/:id', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/user-roles/users/${seeded_user.id}`,
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
    'POST /user-roles/organisation/:organisationId/users/:userId/roles',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'POST',
        url: `/user-roles/organisation/${seeded_organisation.id}/users/${seeded_user.id}/roles`,
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
    'POST /user-roles/organisation/:organisationId/users/:userId/roles',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'POST',
        url: `/user-roles/organisation/${seeded_organisation.id}/users/${seeded_user.id}/roles`,
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
    'PUT /user-roles/organisation/:organisationId/users/:userId/roles/:roleId',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'PUT',
        url: `/user-roles/organisation/${seeded_organisation.id}/users/${seeded_user.id}/roles/${seeded_user_role.id}`,
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
    'PUT /user-roles/organisation/:organisationId/users/:userId/roles/:roleId',
    async (role, getRolePayload) => {
      const data = await app.inject({
        method: 'PUT',
        url: `/user-roles/organisation/${seeded_organisation.id}/users/${seeded_user.id}/roles/${seeded_user_role.id}`,
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

  it('DELETE /user-roles/organisation/:organisationId/users/:userId/roles/:roleId', async () => {
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
      url: `/user-roles/organisation/${seeded_organisation.id}/users/${seeded_user.id}/roles/${userRole.id}`,
      headers: authHeader
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('POST /user-roles/roles/superadmin/:userId', async () => {
    /**
     * This test will need refactoring once the jwts are working
     */
    const data = await app.inject({
      method: 'POST',
      url: `/user-roles/roles/superadmin/${seeded_user}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
  })

  afterAll(async () => {
    await app.close()
  })
})

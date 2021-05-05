import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as jwt from 'jsonwebtoken'
import { Connection, getConnection, Repository } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { JWTRoles } from '../src/models'
import { AuthModule } from '../src/modules/auth/auth.module'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { Subscription } from '../src/modules/subscriptions/entities/subscription.entity'
import { SubscriptionsModule } from '../src/modules/subscriptions/subscriptions.module'
import { Team } from '../src/modules/teams/entities/team.entity'
import { TeamsModule } from '../src/modules/teams/teams.module'
import { UserRole } from '../src/modules/user-roles/entities/user-role.entity'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { mockApp } from './helpers/app'
import { formatRoles } from '../src/helpers/formatRoles'
import UserWithRolesSeed, { DeleteUserWithRolesSeed } from './seeds/user.seed'

describe('Users', () => {
  let app: NestFastifyApplication
  let connection: Connection
  let userRepository: Repository<User>
  let user_roles: UserRole[]
  let decoded_token: { roles: JWTRoles }
  let seeded_organisation: Organisation
  let seeded_team: Team
  let seeded_subscription: Subscription
  let headers

  beforeAll(async () => {
    app = await mockApp({
      imports: [
        AuthModule,
        UsersModule,
        TeamsModule,
        LeaguesModule,
        SubscriptionsModule
      ],
      providers: [],
      controllers: []
    })

    connection = getConnection()
    userRepository = connection.getRepository(User)

    await useSeeding()
    await runSeeder(UserWithRolesSeed)
    const user = await userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.organisation', 'organisation')
      .leftJoinAndSelect('roles.team', 'team')
      .leftJoinAndSelect('roles.subscription', 'subscription')
      .where('user.name = :name', { name: 'TestUser4' })
      .getOne()

    user_roles = user.roles

    for (const userRole of user.roles) {
      if (userRole.role === 'team_admin') {
        seeded_team = userRole.team
      }

      if (userRole.role === 'subscription_admin') {
        seeded_subscription = userRole.subscription
      }

      if (userRole.role === 'organisation_admin') {
        seeded_organisation = userRole.organisation
      }
    }

    const data = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: user.email,
        password: 'passwordIsATerriblePassword'
      }
    })

    const token = data.json().access_token
    headers = {
      Authorization: `Bearer ${token}`
    }
    const decoded = jwt.decode(token) as { roles: JWTRoles }
    decoded_token = decoded
  })

  it('Check The Roles extracted from the JWT to Equal the ones fetched from Database', () => {
    expect(formatRoles(user_roles)).toEqual(decoded_token.roles)
  })

  it('Check That ORG Admin JWT works on Route: GET /organisations/:orgId/teams', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/organisation/${seeded_organisation.id}/teams`,
      headers
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(data.json().length).toBeTruthy()
  })

  it('Check That TEAM Admin JWT works for Route: GET /teams/:teamId/leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/teams/${seeded_team.id}/leagues`,
      headers
    })
    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
  })

  it('Check That SUBSCRIPTION Admin JWT works for Route: GET /subscriptions/:subId', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/subscriptions/${seeded_subscription.id}`,
      headers
    })

    expect(data.statusCode).toEqual(200)
    expect(data.statusMessage).toContain('OK')
  })

  afterAll(async () => {
    await useSeeding()
    await runSeeder(DeleteUserWithRolesSeed)
    await app.close()
  })
})

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, Repository } from 'typeorm'
import { mockApp } from './helpers/app'
import { emailHasContent } from './helpers/mocking'
import { getAuthHeaders } from './helpers/auth'
import { League } from '../src/modules/leagues/entities/league.entity'
import { useSeeding } from 'typeorm-seeding'
import { LeaguesSetup, LeaguesTeardown } from './seeds/leagues.seed'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { JwtService } from '@nestjs/jwt'
import { LeaguesInvitationsService } from '../src/modules/leagues-invitations/leagues-invitations.service'

describe('Leagues Invitations', () => {
  let app: NestFastifyApplication
  let league: League
  let leaguesRepository: Repository<League>
  let user1, user2, user3
  let auth1, auth2

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaguesModule],
      providers: []
    })

    // Run seed
    await useSeeding()
    const leagues = await LeaguesSetup('Leagues Invitations Test', 1)

    const users = await UsersSetup('Leagues Invitations Test', 4)

    leaguesRepository = app.get(Connection).getRepository(League)

    // Retrieve a league to test with
    league = leagues[0]

    // Auth user
    user1 = users[0]
    user2 = users[1]
    user3 = users[2]

    auth1 = getAuthHeaders({}, user1.id)
    auth2 = getAuthHeaders({}, user2.id)

    // Set the league owner to the auth user
    await leaguesRepository
      .createQueryBuilder()
      .relation(League, 'owner')
      .of(league)
      .set(user1)
  })

  afterAll(async () => {
    await LeaguesTeardown('Leagues Invitations Test')
    await UsersTeardown('Leagues Invitations Test')
    await app.close()
  })

  it(`POST /leagues/:leagueId/invitations 201 League owner can invite a user`, async () => {
    const data = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/invitations`,
      headers: auth1,
      payload: {
        userId: user2.id
      }
    })

    expect(data.statusCode).toEqual(201)

    const json = data.json()
    const { invitation, inviteLink } = json
    expect(invitation.league.id).toEqual(league.id)
    expect(invitation.from_user.id).toEqual(user1.id)
    expect(invitation.to_user.id).toEqual(user2.id)

    // Check email content
    // All emails are mocked to email-debug.log in jest tests
    expect(await emailHasContent(inviteLink)).toEqual(true)
  })

  it(`POST /leagues/:leagueId/invitations 403 A non-participating non-owner user cannot invite a user to a private league`, async () => {
    const data = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/invitations`,
      headers: auth2,
      payload: {
        userId: user3.id
      }
    })

    expect(data.statusCode).toEqual(403)
    expect(data.json().message).toContain('not have permission')
  })

  it(`POST /leagues/:leagueId/invitations 403 A participating non-owner user can invite a user to a private league`, async () => {
    const league = (await LeaguesSetup('Leagues Invitations Test', 1))[0]

    // Set the league owner to the auth user
    await leaguesRepository
      .createQueryBuilder()
      .relation(League, 'owner')
      .of(league)
      .set(user1)

    // Add a user to the league
    await leaguesRepository
      .createQueryBuilder()
      .relation(League, 'users')
      .of(league)
      .add(user2)

    const data = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/invitations`,
      headers: auth2,
      payload: {
        userId: user3.id
      }
    })

    expect(data.statusCode).toEqual(201)
    const json = data.json()
    const { invitation, inviteLink } = json
    expect(invitation.league.id).toEqual(league.id)
    expect(invitation.from_user.id).toEqual(user2.id)
    expect(invitation.to_user.id).toEqual(user3.id)

    // Check email content
    // All emails are mocked to email-debug.log in jest tests
    expect(await emailHasContent(inviteLink)).toEqual(true)
  })

  it(`POST /leagues/:leagueId/invitations 201 Invited user can join a league using invitation`, async () => {
    const league = (await LeaguesSetup('Leagues Invitations Test', 1))[0]

    // Set the league owner to the auth user
    await leaguesRepository
      .createQueryBuilder()
      .relation(League, 'owner')
      .of(league)
      .set(user1)

    const data = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/invitations`,
      headers: auth1,
      payload: {
        userId: user2.id
      }
    })

    expect(data.statusCode).toEqual(201)

    const json = data.json()
    const { invitation, inviteLink, token } = json
    expect(invitation.league.id).toEqual(league.id)
    expect(invitation.from_user.id).toEqual(user1.id)
    expect(invitation.to_user.id).toEqual(user2.id)

    // Check email content
    // All emails are mocked to email-debug.log in jest tests
    expect(await emailHasContent(inviteLink)).toEqual(true)

    // Redeem invitation
    const redeem = await app.inject({
      method: 'POST',
      url: `/leagues/join`,
      headers: auth2,
      payload: { token }
    })

    expect(redeem.statusCode).toEqual(200)
    expect(redeem.json().success).toEqual(true)
    expect(redeem.json().league.id).toEqual(league.id)

    const get = await app.inject({
      method: 'GET',
      url: '/me/leagues',
      headers: auth2,
      query: { page: '0', limit: '100' }
    })

    // Expect the user to have this league in their own list
    expect(get.json().results.filter((e) => e.id === league.id).length).toEqual(
      1
    )
  })

  it(`POST /leagues/:leagueId/invitations 400 Invited user cannot join a league using invitation with invalid token`, async () => {
    const league = (await LeaguesSetup('Leagues Invitations Test', 1))[0]

    // Make the JWT using an incorrect secret
    jest
      .spyOn(app.get(LeaguesInvitationsService), 'createToken')
      .mockImplementationOnce((id) => {
        const payload = app.get(LeaguesInvitationsService).getJwtPayload(id)
        return app.get(JwtService).sign(payload, { secret: 'wrong' })
      })

    // Set the league owner to the auth user
    await leaguesRepository
      .createQueryBuilder()
      .relation(League, 'owner')
      .of(league)
      .set(user1)

    const data = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/invitations`,
      headers: auth1,
      payload: {
        userId: user2.id
      }
    })

    expect(data.statusCode).toEqual(201)

    // Redeem invitation
    const redeem = await app.inject({
      method: 'POST',
      url: `/leagues/join`,
      headers: auth2,
      payload: { token: data.json().token }
    })

    expect(redeem.statusCode).toEqual(400)
    expect(redeem.json().message).toEqual('Token is invalid')
  })
})

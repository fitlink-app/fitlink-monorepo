import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { FeedItem } from '../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedItemCategory,
  FeedItemType
} from '../src/modules/feed-items/feed-items.constants'
import { FollowingsModule } from '../src/modules/followings/followings.module'
import { Image } from '../src/modules/images/entities/image.entity'
import { LeaderboardEntry } from '../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesInvitationModule } from '../src/modules/leagues-invitations/leagues-invitations.module'
import { CreateLeagueDto } from '../src/modules/leagues/dto/create-league.dto'
import { UpdateLeagueDto } from '../src/modules/leagues/dto/update-league.dto'
import { League } from '../src/modules/leagues/entities/league.entity'
import { LeagueAccess } from '../src/modules/leagues/leagues.constants'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import { Team } from '../src/modules/teams/entities/team.entity'
import { User } from '../src/modules/users/entities/user.entity'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { ImagesSetup } from './seeds/images.seed'
import {
  LeaguesSetup,
  LeaguesTeardown,
  TeamAssignedLeagueSetup,
  TeamAssignedLeagueTeardown,
  OrganisationAssignedLeagueSetup,
  OrganisationAssignedLeagueTeardown,
  LeagueWithEntriesAndWinningUsers
} from './seeds/leagues.seed'
import { SportSetup, SportsTeardown } from './seeds/sport.seed'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'

describe('Leagues', () => {
  let app: NestFastifyApplication
  let superadminHeaders: NodeJS.Dict<string>
  let teamAdminHeaders: NodeJS.Dict<string>
  let authHeaders: NodeJS.Dict<string>
  let authHeaders2: NodeJS.Dict<string>
  let authHeaders3: NodeJS.Dict<string>
  let seeded_league: League
  let seeded_team: Team
  let seeded_organisation: Organisation
  let team_assigned_league: League
  let organisation_assigned_league: League
  let images: Image[]
  let sportId: string
  let sportName: string
  let user1: string
  let user2: string
  let user3: string
  let user4: string
  let userData4: User
  let leagueWithLeaderboardAndUsers: League[]

  beforeAll(async () => {
    app = await mockApp({
      imports: [LeaguesModule, FollowingsModule, LeaguesInvitationModule],
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

    sportId = sport.id

    const leagues = await LeaguesSetup('Test League')
    const usersForLeague = await UsersSetup('Da Usas', 24)
    leagueWithLeaderboardAndUsers = await LeagueWithEntriesAndWinningUsers(
      'Da Leagues',
      usersForLeague
    )

    team_assigned_league = await TeamAssignedLeagueSetup('Test Team League')
    organisation_assigned_league = await OrganisationAssignedLeagueSetup(
      'Test Organisation League'
    )

    const users = await UsersSetup('Test League', 4)
    user1 = users[0].id
    user2 = users[1].id
    user3 = users[2].id
    user4 = users[3].id
    userData4 = users[3]

    authHeaders = getAuthHeaders({}, user1)
    authHeaders2 = getAuthHeaders({}, user2)
    authHeaders3 = getAuthHeaders({}, user3)

    images = await ImagesSetup('Test League', 20)

    // Get Currently Seeded Data.
    seeded_league = leagues[0]

    // // Get the team name to use it's credentials for testing
    seeded_team = team_assigned_league.team

    // Get the organisation
    seeded_organisation = organisation_assigned_league.organisation

    // // Get the League that is already assigned to our team aka teams[0]
    if (seeded_team) {
      teamAdminHeaders = getAuthHeaders({ t_a: [seeded_team.id] })
    }

    // Add a user to the league
    await app
      .get(Connection)
      .getRepository(League)
      .createQueryBuilder()
      .relation(League, 'users')
      .of(seeded_league.id)
      .add(user1)

    // Add a user to the team (authHeaders3)
    await app
      .get(Connection)
      .getRepository(Team)
      .createQueryBuilder()
      .relation(Team, 'users')
      .of(seeded_team.id)
      .add([user3, user4])

    // Add a user to the team underneath the organisation
    await app
      .get(Connection)
      .getRepository(Team)
      .createQueryBuilder()
      .relation(Team, 'users')
      .of(seeded_organisation.teams[0].id)
      .add(user2)
  })

  afterAll(async () => {
    await LeaguesTeardown('Test League')
    await TeamAssignedLeagueTeardown('Test Team League')
    await OrganisationAssignedLeagueTeardown('Test Organisation League')
    await UsersTeardown('Test League')
    await SportsTeardown(sportName)
    await app.close()
  })

  it('POST /leagues 201 A user can create a private league', async () => {
    const imageId = images.pop().id
    const payload: CreateLeagueDto = {
      name: 'Test League',
      description: 'A league for testers',
      sportId: sportId,
      duration: 7,
      repeat: true,
      imageId
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload
    })

    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toEqual('Test League')
    expect(data.json().repeat).toEqual(true)
    expect(data.json().duration).toEqual(7)
    expect(data.json().sport.id).toEqual(sportId)
    expect(data.json().owner.id).toEqual(user1)
    expect(data.json().image.id).toEqual(imageId)

    const get = await app.inject({
      method: 'GET',
      url: `/leagues/${data.json().id}`,
      headers: authHeaders
    })

    expect(get.json().is_owner).toEqual(true)

    // A user is always joined automatically to a private league
    expect(get.json().participating).toEqual(true)
  })

  it('POST /leagues 201 A user can invite friends to a private league', async () => {
    const imageId = images.pop().id
    const payload: CreateLeagueDto = {
      name: 'Test League',
      description: 'A league for people I follow',
      sportId: sportId,
      duration: 7,
      repeat: true,
      imageId
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload
    })

    const leagueId = data.json().id

    expect(data.statusCode).toEqual(201)

    const inviteables = await app.inject({
      method: 'GET',
      url: `/leagues/${leagueId}/inviteable`,
      headers: authHeaders
    })

    expect(inviteables.json().results.length).toBe(0)

    // Follow the other users
    const follow1 = await followUser(user2, authHeaders)
    const follow2 = await followUser(user3, authHeaders)
    const follow3 = await followUser(user4, authHeaders)

    expect(follow1.statusCode).toBe(201)
    expect(follow2.statusCode).toBe(201)
    expect(follow3.statusCode).toBe(201)

    const inviteables2 = await app.inject({
      method: 'GET',
      url: `/leagues/${leagueId}/inviteable`,
      headers: authHeaders
    })

    expect(inviteables2.json().results.length).toBe(3)
    expect(inviteables2.json().results.filter((e) => e.invited).length).toBe(0)

    const invite = await app.inject({
      method: 'POST',
      url: `/leagues/${leagueId}/invitations`,
      headers: authHeaders,
      payload: {
        userId: user2
      }
    })

    expect(invite.statusCode).toBe(201)

    const inviteables3 = await app.inject({
      method: 'GET',
      url: `/leagues/${leagueId}/inviteable`,
      headers: authHeaders
    })

    expect(inviteables3.json().results.length).toBe(3)
    expect(inviteables3.json().results.filter((e) => e.invited).length).toBe(1)
  })

  it('POST /leagues 400 A user cannot join a league twice', async () => {
    const imageId = images.pop().id
    const payload: CreateLeagueDto = {
      name: 'Test League',
      description: 'A league for testers',
      sportId: sportId,
      duration: 7,
      repeat: true,
      imageId
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload
    })

    expect(data.statusCode).toEqual(201)

    const join = await app.inject({
      method: 'POST',
      url: `/leagues/${data.json().id}/join`,
      headers: authHeaders
    })

    expect(join.statusCode).toEqual(400)
    expect(join.json().message).toContain('already joined this league')
  })

  it('PUT /leagues 200 A user can edit their own private league & sport cannot be changed', async () => {
    const imageId = images.pop().id

    const post = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload: {
        name: 'Test League',
        description: 'A league for testers',
        sportId: sportId,
        duration: 7,
        repeat: true,
        imageId
      }
    })

    const payload: UpdateLeagueDto = {
      name: 'Test League 2',
      description: 'An updated league',
      sportId: sportId
    }

    const put = await app.inject({
      method: 'PUT',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders,
      payload
    })

    expect(put.statusCode).toEqual(400)
    expect(put.json().errors.sportId).toContain('cannot be changed')

    // Allow images to be updated
    const imageId2 = images.pop().id
    const putOk = await app.inject({
      method: 'PUT',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders,
      payload: { ...payload, imageId: imageId2, sportId: undefined }
    })

    expect(putOk.statusCode).toEqual(200)

    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders,
      payload
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().name).toEqual('Test League 2')
    expect(data.json().description).toEqual('An updated league')
    expect(data.json().image.id).toEqual(imageId2)

    const myLeagues = await app.inject({
      method: 'GET',
      url: `/me/leagues`,
      headers: authHeaders,
      query: {
        limit: '1000'
      }
    })

    expect(
      myLeagues.json().results.filter((e) => e.id === post.json().id).length
    ).toBe(1)

    // Ensure original image is preserved
    const putNoImage = await app.inject({
      method: 'PUT',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders,
      payload: { ...payload, sportId: undefined }
    })

    expect(putNoImage.statusCode).toEqual(200)

    const getPutNoImage = await app.inject({
      method: 'GET',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders,
      payload
    })

    // Expect original image to be there
    expect(getPutNoImage.json().image.id).toEqual(imageId2)
  })

  it("PUT /leagues 403 Another user cannot read or edit another user' private league", async () => {
    const imageId = images.pop().id

    const post = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload: {
        name: 'Test League',
        description: 'A league for testers',
        sportId: sportId,
        duration: 7,
        repeat: false,
        imageId
      }
    })

    const payload: UpdateLeagueDto = {
      name: 'Test League 2',
      description: 'An updated league'
    }

    const put = await app.inject({
      method: 'PUT',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders2,
      payload
    })

    const get = await app.inject({
      method: 'GET',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders2
    })

    expect(put.statusCode).toEqual(403)
    expect(get.statusCode).toEqual(403)
    expect(put.json().message).toContain('not have permission')
    expect(get.json().message).toContain('not have permission')

    const get2 = await app.inject({
      method: 'GET',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders
    })

    expect(get2.json().id).toBe(post.json().id)
  })

  it('DELETE /leagues/:id A user cannot delete a league they do not own', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/leagues/${seeded_league.id}`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(403)
  })

  it('DELETE /leagues/:id A user can delete a private league that they own and have joined', async () => {
    const imageId = images.pop().id

    const post = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: authHeaders,
      payload: {
        name: 'Test League',
        description: 'A league for test deletion',
        sportId: sportId,
        duration: 7,
        repeat: false,
        imageId
      }
    })

    const league = post.json()

    expect(league.owner.id).toBe(user1)
    expect(league.image.id).toBeDefined()

    const data = await app.inject({
      method: 'DELETE',
      url: `/leagues/${league.id}`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(200)

    const get = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders
    })

    expect(get.statusCode).toBe(404)
  })

  it('POST /leagues 201 A superadmin can create a fully public league', async () => {
    const imageId = images.pop().id
    const payload: CreateLeagueDto = {
      name: 'Public Test League',
      description: 'A public league for testers',
      sportId: sportId,
      duration: 7,
      repeat: true,
      imageId,
      access: LeagueAccess.Public
    }
    const post = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: superadminHeaders,
      payload
    })

    const get = await app.inject({
      method: 'GET',
      url: `/leagues/${post.json().id}`,
      headers: authHeaders2
    })

    expect(post.statusCode).toEqual(201)
    expect(get.json().name).toEqual('Public Test League')
    expect(get.json().repeat).toEqual(true)
    expect(get.json().duration).toEqual(7)
    expect(get.json().owner).toBe(null)
    expect(get.json().sport.id).toEqual(sportId)
    expect(get.json().image.id).toEqual(imageId)
  })

  it('POST /leagues/:leagueId/join 201 A user can join any public league', async () => {
    const league = await createPublicLeague()

    const post = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/join`,
      headers: authHeaders
    })

    const get = await app.inject({
      method: 'GET',
      url: '/me/leagues',
      headers: authHeaders,
      query: {
        page: '0',
        limit: '100'
      }
    })

    expect(post.statusCode).toEqual(201)
    expect(post.json().success).toEqual(true)
    expect(post.json().league.id).toEqual(league.id)
    expect(post.json().leaderboardEntry.id).toBeDefined()
    expect(get.json().results[0].rank).toBe(1)
    expect(get.json().results.filter((e) => e.id === league.id).length).toEqual(
      1
    )
    expect(get.json().results.filter((e) => e.participating).length).toEqual(
      get.json().results.length
    )

    // Check participants count
    const count = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders
    })

    expect(count.json().participants_total).toEqual(1)
    expect(count.json().participating).toEqual(true)
  })

  it('POST /leagues/:leagueId/leave 200 A user can leave any public league', async () => {
    const league = await createPublicLeague()

    const post = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/join`,
      headers: authHeaders
    })

    const get1 = await app.inject({
      method: 'GET',
      url: '/me/leagues',
      headers: authHeaders,
      query: {
        page: '0',
        limit: '100'
      }
    })

    const leave = await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/leave`,
      headers: authHeaders
    })

    const get2 = await app.inject({
      method: 'GET',
      url: '/me/leagues',
      headers: authHeaders,
      query: {
        page: '0',
        limit: '100'
      }
    })

    // Join
    expect(post.statusCode).toEqual(201)
    expect(post.json().success).toEqual(true)
    expect(
      get1.json().results.filter((e) => e.id === league.id).length
    ).toEqual(1)

    // Leave
    expect(leave.statusCode).toEqual(200)
    expect(leave.json()).toEqual({ success: true })
    expect(
      get2.json().results.filter((e) => e.id === league.id).length
    ).toEqual(0)

    // Check participants count
    const count = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders
    })

    expect(count.json().participants_total).toEqual(0)
    expect(count.json().participating).toEqual(false)
  })

  // Note that private league tests are found in leagues-invitations.e2e-spec.ts

  it('GET /leagues', async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/leagues',
      headers: superadminHeaders
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().results.length).toBeGreaterThan(0)
  })

  it('GET /leagues/:leagueId/inviteable A user can appear in search if they qualify to be invited to a league', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${team_assigned_league.id}/inviteable`,
      headers: authHeaders3,
      query: {
        q: userData4.email
      }
    })

    expect(data.json().results.length).toBe(1)
    expect(data.json().results[0].id).toBe(userData4.id)
    expect(data.json().results[0].following).toBeDefined()
    expect(data.json().results[0].follower).toBeDefined()

    const data2 = await app.inject({
      method: 'GET',
      url: `/leagues/${team_assigned_league.id}/inviteable`,
      headers: authHeaders3,
      query: {
        limit: '1000',
        q: 'test'
      }
    })

    expect(data2.json().results.filter((e) => e.id === user1).length).toBe(0)
    expect(data2.json().results.filter((e) => e.id === user2).length).toBe(0)
  })

  it('GET /leagues A user can retrieve all leagues including for teams/organisations they belong to or private leagues (i.e. "explore feature")', async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/leagues',
      headers: authHeaders3
    })

    expect(data.statusCode).toEqual(200)
    expect(data.json().results.length).toBeGreaterThan(0)

    // Expect some of the leagues to be team leagues
    expect(
      data.json().results.filter((e) => !!(e.team && e.team.id)).length
    ).toBeGreaterThan(0)

    // Expect not to be ranked in all the leagues
    expect(
      data.json().results.filter((e) => e.rank === null).length
    ).toBeGreaterThan(0)
  })

  it('GET /leagues A user can search all leagues including for teams/organisations they belong to or private leagues', async () => {
    // Join the user to the team
    await createPublicLeague({
      name: 'Early morning joggers'
    })

    const search1 = await app.inject({
      method: 'GET',
      url: '/leagues/search',
      headers: authHeaders3,
      query: {
        q: 'morn'
      }
    })

    expect(search1.statusCode).toEqual(200)
    expect(search1.json().results.length).toBeGreaterThan(0)
    expect(
      search1.json().results.filter((e) => e.name.indexOf('morning') > -1)
        .length
    ).toBeGreaterThan(0)
    expect(
      search1.json().results.filter((e) => e.name.indexOf('Team') > -1).length
    ).toBe(0)
    // expect(search1.json().results[0].rank).toBe(null)

    const search2 = await app.inject({
      method: 'GET',
      url: '/leagues/search',
      headers: authHeaders3,
      query: {
        q: 'team'
      }
    })

    expect(
      search2.json().results.filter((e) => e.name.indexOf('morning') > -1)
        .length
    ).toBe(0)
    expect(
      search2.json().results.filter((e) => e.name.indexOf('Team') > -1).length
    ).toBeGreaterThan(0)
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

  it(`GET /leagues/:id A superadmin can get any league`, async () => {
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

  it(`GET /leagues/:id An ordinary user can get any public league or private league they have access to`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${seeded_league.id}`,
      headers: authHeaders
    })

    const payload = data.json()
    expect(data.statusCode).toBe(200)
    expect(payload.id).toBe(seeded_league.id)
    expect(payload.name).toBeDefined()
  })

  it(`GET /leagues/:id A team user can get any team or organisation league they have access to`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${team_assigned_league.id}`,
      headers: authHeaders3
    })

    const data2 = await app.inject({
      method: 'GET',
      url: `/leagues/${team_assigned_league.id}`,
      headers: authHeaders
    })

    const data3 = await app.inject({
      method: 'GET',
      url: `/leagues/${organisation_assigned_league.id}`,
      headers: authHeaders3
    })

    const data4 = await app.inject({
      method: 'GET',
      url: `/leagues/${organisation_assigned_league.id}`,
      headers: authHeaders2
    })

    expect(data.statusCode).toBe(200)
    expect(data.json().id).toBe(team_assigned_league.id)
    expect(data.json().team.avatar).toBeDefined()

    expect(data2.statusCode).toBe(403)
    expect(data2.json().message).toContain('not have permission')

    expect(data3.statusCode).toBe(403)
    expect(data3.json().message).toContain('not have permission')

    expect(data4.statusCode).toBe(200)
    expect(data4.json().id).toBe(organisation_assigned_league.id)
    expect(data4.json().organisation.avatar).toBeDefined()
  })

  it(`GET /leagues/:id/members A user can get the members/ranks of a league`, async () => {
    const league = (await LeaguesSetup('Test League'))[0]

    // Set the league as public
    await app.get(Connection).getRepository(League).update(league.id, {
      access: LeagueAccess.Public
    })

    await joinLeague(authHeaders)
    await joinLeague(authHeaders2)
    await joinLeague(authHeaders3)

    // Apply leaderboard points manually
    const repo = app.get(Connection).getRepository(LeaderboardEntry)
    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user1 }
      },
      {
        points: 200
      }
    )

    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user2 }
      },
      {
        points: 300
      }
    )

    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user3 }
      },
      {
        points: 100
      }
    )

    const get1 = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders
    })

    expect(get1.json().rank).toBe(2)

    const get2 = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders2
    })

    expect(get2.json().rank).toBe(1)

    const get3 = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}`,
      headers: authHeaders3
    })

    expect(get3.json().rank).toBe(3)

    const data = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}/members`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.json().results.length).toBe(3)
    expect(data.json().results[0].id).toBeDefined()
    expect(data.json().results[0].points).toBeDefined()
    expect(data.json().results[0].wins).toBeDefined()
    expect(data.json().results[0].user.avatar).toBeDefined()

    // Make sure user data hasn't leaked
    expect(data.json().results[0].user.email).toBeUndefined()
    expect(data.json().results[0].user.password).toBeUndefined()

    // Gets the rank of the current user within the leaderboard
    const rank = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}/rank`,
      headers: authHeaders
    })

    expect(rank.json().results[0].user.id).toEqual(user2)
    expect(rank.json().results[1].user.id).toEqual(user1)
    expect(rank.json().results[2].user.id).toEqual(user3)

    // Make sure user data hasn't leaked
    expect(rank.json().results[0].user.email).toBeUndefined()
    expect(rank.json().results[0].user.password).toBeUndefined()

    // Try a different rank
    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user1 }
      },
      {
        points: 100
      }
    )

    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user2 }
      },
      {
        points: 200
      }
    )

    await repo.update(
      {
        leaderboard: { id: league.active_leaderboard.id },
        user: { id: user3 }
      },
      {
        points: 300
      }
    )

    // Gets the rank of the current user within the leaderboard
    const rank2 = await app.inject({
      method: 'GET',
      url: `/leagues/${league.id}/rank`,
      headers: authHeaders
    })

    expect(rank2.json().results[0].user.id).toEqual(user2)
    expect(rank2.json().results[1].user.id).toEqual(user1)

    async function joinLeague(headers: NodeJS.Dict<string>) {
      return await app.inject({
        method: 'POST',
        url: `/leagues/${league.id}/join`,
        headers
      })
    }
  })

  // A team admin can access a team league
  it(`GET /teams/:teamId/leagues/:id`, async () => {
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

  it('POST /leagues 201 A superadmin can create a fully public league', async () => {
    const imageId = images.pop().id

    const payload: CreateLeagueDto = {
      description: faker.name.jobDescriptor(),
      name: faker.name.jobTitle(),
      sportId,
      imageId,
      duration: 7,
      repeat: true,
      access: LeagueAccess.Public
    }
    const data = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: superadminHeaders,
      payload: payload
    })

    expect(data.statusCode).toBe(201)

    const json = data.json()
    expect(json.id).toBeDefined()
    expect(json.name).toBeDefined()
    expect(json.description).toBeDefined()
    expect(json.active_leaderboard.id).toBeDefined()
  })

  it('POST /teams/:teamId/leagues', async () => {
    const imageId = images.pop().id

    const payload: CreateLeagueDto = {
      description: faker.name.jobDescriptor(),
      name: faker.name.jobTitle(),
      sportId: sportId,
      duration: 7,
      repeat: false,
      imageId
    }
    const data = await app.inject({
      method: 'POST',
      url: `/teams/${seeded_team.id}/leagues`,
      headers: teamAdminHeaders,
      payload: payload
    })
    const json = data.json()
    expect(data.statusCode).toBe(201)
    expect(json.id).toBeDefined()
    expect(json.name).toBeDefined()
    expect(json.description).toBeDefined()
    expect(json.active_leaderboard.id).toBeDefined()
    expect(json.team.id).toBeDefined()
    expect(json.access).toEqual(LeagueAccess.Team)
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
    expect(parsed.affected).toBe(1)
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
    expect(parsed.affected).toBe(1)
  })

  it('DELETE /leagues/:id A superadmin can delete a league', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/leagues/${seeded_league.id}`,
      headers: superadminHeaders
    })

    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('DELETE teams/teamId/leagues/:id', async () => {
    const data = await app.inject({
      method: 'DELETE',
      url: `/teams/${seeded_team.id}/leagues/${team_assigned_league.id}`,
      headers: teamAdminHeaders
    })

    1
    expect(data.statusMessage).toBe('OK')
    // After we're done deleting the seeded data we need to re run it.
    // await runSeeder(TeamAssignedLeagueSetup)
  })

  // TODO: This work is still only partially complete:
  // Organisation and team creation / edit / delete of leagues
  // Organisation-wide leagues
  // Team-wide leagues

  async function createPublicLeague(override?: Partial<CreateLeagueDto>) {
    const imageId = images.pop().id
    const payload: CreateLeagueDto = {
      name: 'Public Test League',
      description: 'A public league for testers',
      sportId: sportId,
      duration: 7,
      repeat: true,
      imageId,
      access: LeagueAccess.Public,
      ...override
    }
    const post = await app.inject({
      method: 'POST',
      url: '/leagues',
      headers: superadminHeaders,
      payload
    })

    return post.json()
  }

  async function followUser(userId: string, authHeaders: NodeJS.Dict<string>) {
    return app.inject({
      method: 'POST',
      url: `/me/following`,
      headers: authHeaders,
      payload: {
        targetId: userId
      }
    })
  }

  it('Tests that a feed entry is created when you join a league', async () => {
    const league = await createPublicLeague()

    await app.inject({
      method: 'POST',
      url: `/leagues/${league.id}/join`,
      headers: authHeaders
    })

    const feedItem = await getConnection()
      .getRepository(FeedItem)
      .findOne({
        where: {
          category: FeedItemCategory.MyUpdates,
          type: FeedItemType.LeagueJoined,
          league: {
            id: league.id
          }
        },
        relations: ['league']
      })

    expect(feedItem.league.id).toBe(league.id)
    expect(feedItem.category).toBe(FeedItemCategory.MyUpdates)
    expect(feedItem.type).toBe(FeedItemType.LeagueJoined)
  })

  it.only('League Winners Feed Item Creation', async () => {
    let leagueId = leagueWithLeaderboardAndUsers[0].id

    const data = await app.inject({
      method: 'GET',
      url: `/winner/${leagueId}`,
      headers: superadminHeaders
    })
    const winners = data.json().winners

    let results: FeedItem[] = await Promise.all(
      winners.map(async (w: LeaderboardEntry) => {
        return getConnection()
          .getRepository(FeedItem)
          .findOne({
            where: {
              category: FeedItemCategory.MyUpdates,
              type: FeedItemType.LeagueWon,
              league: {
                id: leagueId
              },
              user: {
                id: w.user_id
              }
            },
            relations: ['league', 'user']
          })
      })
    )

    for (const r of results) {
      expect(r.league.id).toBe(leagueId)
      expect(r.category).toBe(FeedItemCategory.MyUpdates)
      expect(r.type).toBe(FeedItemType.LeagueWon)
    }
  })
})

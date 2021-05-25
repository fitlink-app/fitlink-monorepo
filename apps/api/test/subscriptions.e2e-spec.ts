import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Subscription } from '../src/modules/subscriptions/entities/subscription.entity'
import { Connection, getConnection, In } from 'typeorm'
import { SubscriptionsModule } from '../src/modules/subscriptions/subscriptions.module'
import { getAuthHeaders } from './helpers/auth'
import { UpdateSubscriptionDto } from '../src/modules/subscriptions/dto/update-subscription.dto'
import { CreateDefaultSubscriptionDto } from '../src/modules/subscriptions/dto/create-default-subscription.dto'
import { Team } from '../src/modules/teams/entities/team.entity'
import { User } from '../src/modules/users/entities/user.entity'
import { Organisation } from '../src/modules/organisations/entities/organisation.entity'
import {
  SubscriptionsSetup,
  SubscriptionsTeardown
} from './seeds/subscriptions.seed'
import { useSeeding } from 'typeorm-seeding'

let connection: Connection

async function getSubscriptions(name: string) {
  const repository = connection.getRepository(Subscription)
  return repository.find({
    relations: ['organisation'],
    where: { billing_entity: name }
  })
}

async function getSubscriptionWithUsers(name: string) {
  const repository = connection.getRepository(Subscription)
  return repository.find({
    relations: ['organisation', 'users'],
    where: { billing_entity: name }
  })
}

async function getSubscriptionTeam(name: string, teamId?: string) {
  const repository = connection.getRepository(Team)
  if (!teamId) {
    return repository.findOne({
      where: { name },
      relations: ['users']
    })
  } else {
    return repository.findOne({
      where: { id: teamId, name },
      relations: ['users']
    })
  }
}

async function getSubscriptionUsers(name: string) {
  const repository = connection.getRepository(User)
  return repository.find({
    where: { name },
    take: 3
  })
}

async function getOrganisationById(orgId: string) {
  const repository = connection.getRepository(Organisation)
  return await repository.findOne({
    where: { id: orgId },
    relations: ['teams']
  })
}

describe('Subscriptions', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let organisationAdminHeaders
  let subscriptionAdminHeaders
  let authHeaders
  let subscription: Subscription

  beforeAll(async () => {
    app = await mockApp({
      imports: [SubscriptionsModule],
      providers: []
    })

    // Retrieve an subscription to test with
    await useSeeding()

    connection = app.get(Connection)

    const seed = await SubscriptionsSetup('Test Subscription')

    subscription = seed[0]
    // Superadmin
    superadminHeaders = getAuthHeaders({ spr: true })
    // Org admin
    organisationAdminHeaders = getAuthHeaders({
      o_a: [subscription.organisation.id]
    })
    // Subscription admin
    subscriptionAdminHeaders = getAuthHeaders({ s_a: [subscription.id] })
    // Auth user
    authHeaders = getAuthHeaders()
  })

  afterAll(async () => {
    await SubscriptionsTeardown('Test Subscription')
    await app.close()
  })

  const testSuperOrgAdmain = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an organisation admin', () => organisationAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testSuperOrgAdmain(
    `POST /organisations/:organisationId/subscriptions creating subscription by admins should result in 201 created`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const payload = { ...rest } as CreateDefaultSubscriptionDto
      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
      const jsonResult = Object.keys(result.json())
      expect(jsonResult).toEqual(
        expect.arrayContaining([
          'created_at',
          'updated_at',
          'id',
          'billing_entity',
          'billing_address_1',
          'billing_address_2',
          'billing_country',
          'billing_country_code',
          'billing_state',
          'billing_city',
          'billing_postcode',
          'type',
          'default',
          'organisation'
        ])
      )
    }
  )

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an organisation admin', () => organisationAdminHeaders],
    ['a subscription admin', () => subscriptionAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testAll(
    `GET /organisations/:organisationId/subscriptions/:subscriptionId getting subscription`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const result = await app.inject({
        method: 'GET',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(200)
      const jsonResult = Object.keys(result.json())
      expect(jsonResult).toEqual(
        expect.arrayContaining([
          'created_at',
          'updated_at',
          'id',
          'billing_entity',
          'billing_address_1',
          'billing_address_2',
          'billing_country',
          'billing_country_code',
          'billing_state',
          'billing_city',
          'billing_postcode',
          'type',
          'default',
          'organisation'
        ])
      )
    }
  )

  testAll(
    `PUT /organisations/:organisationId/subscriptions/:subscriptionId updating subscription`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const payload = { ...rest } as UpdateSubscriptionDto
      const result = await app.inject({
        method: 'PUT',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(200)
      expect(result.json().affected).toEqual(1)
    }
  )

  testAll(
    `PUT /organisations/:organisationId/subscriptions/:subscriptionId trying to update subscription with incorrect organisationId`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const payload = { ...rest } as UpdateSubscriptionDto
      const wrongOrganisationId = '15d81974-8214-419e-a587-a49a82b19433'
      const result = await app.inject({
        method: 'PUT',
        url: `/subscriptions/organisations/${wrongOrganisationId}/subscriptions/${id}`,
        headers: getHeaders(),
        payload
      })

      if (
        type === 'an authenticated user' ||
        type === 'an organisation admin'
      ) {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(400)
      expect(result.json().message).toContain("the subscription doesn't exist")
    }
  )

  const testSuperAdmainAndUser = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testSuperAdmainAndUser(
    `DELETE /organisations/:organisationId/subscriptions/:subscriptionId deleting subscription by superAdmain`,
    async (type, getHeaders) => {
      const seed = await getSubscriptions('Test Subscription')
      const anotherSubscription = seed[0]
      const { organisation, id, ...rest } = anotherSubscription
      const result = await app.inject({
        method: 'DELETE',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(200)
      expect(result.body).toEqual('subscription is deleted')
    }
  )

  it(`DELETE /organisations/:organisationId/subscriptions/:subscriptionId deleting subscription by organisationAdmin`, async () => {
    const seed = await getSubscriptions('Test Subscription')
    const anotherSubscription = seed[0]
    const { organisation, id, ...rest } = anotherSubscription
    const result = await app.inject({
      method: 'DELETE',
      url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}`,
      headers: getAuthHeaders({ o_a: [organisation.id] })
    })
    expect(result.statusCode).toEqual(200)
    expect(result.body).toEqual('subscription is deleted')
  })

  testSuperOrgAdmain(
    `DELETE /organisations/:organisationId/subscriptions/:subscriptionId trying to delete subscription with incorrect organisation id`,
    async (type, getHeaders) => {
      const seed = await getSubscriptions('Test Subscription')
      const anotherSubscription = seed[0]
      const { organisation, id, ...rest } = anotherSubscription
      const wrongOrganisationId = '15d81974-8214-419e-a587-a49a82b19433'
      const result = await app.inject({
        method: 'DELETE',
        url: `/subscriptions/organisations/${wrongOrganisationId}/subscriptions/${id}`,
        headers: getHeaders()
      })

      if (
        type === 'an authenticated user' ||
        type === 'an organisation admin'
      ) {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(400)
      expect(result.json().message).toContain("the subscription doesn't exist")
    }
  )

  it(`DELETE /organisations/:organisationId/subscriptions/:subscriptionId trying to delete subscription by subscription admin with incorrect organisation id`, async () => {
    const seed = await getSubscriptions('Test Subscription')
    const anotherSubscription = seed[0]
    const { organisation, id, ...rest } = anotherSubscription
    const wrongOrganisationId = '15d81974-8214-419e-a587-a49a82b19433'
    const result = await app.inject({
      method: 'DELETE',
      url: `/subscriptions/organisations/${wrongOrganisationId}/subscriptions/${id}`,
      headers: getAuthHeaders({ s_a: [id] })
    })
    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toContain("the subscription doesn't exist")
  })
})

/**
 * Assigning users (after a subscription already exists)
 */
describe('Assigning users to the subscriptions', () => {
  let app: NestFastifyApplication
  let superadminHeaders
  let organisationAdminHeaders
  let subscriptionAdminHeaders
  let authHeaders
  let subscription: Subscription
  let team: Team
  let seed

  beforeAll(async () => {
    app = await mockApp({
      imports: [SubscriptionsModule],
      providers: []
    })

    // Retrieve an subscription to test with
    await SubscriptionsSetup('Test Subscription Assignment')
    seed = await getSubscriptionWithUsers('Test Subscription Assignment')
    subscription = seed[0]
    while (subscription.users.length < 1) {
      subscription = seed[0]
    }
    // Retrieve an team to test with
    team = await getSubscriptionTeam('Test Subscription Assignment')

    // Superadmin
    superadminHeaders = getAuthHeaders({ spr: true })
    // Org admin
    organisationAdminHeaders = getAuthHeaders({
      o_a: [subscription.organisation.id]
    })
    // Subscription admin
    subscriptionAdminHeaders = getAuthHeaders({ s_a: [subscription.id] })
    // Auth user
    authHeaders = getAuthHeaders()
  })

  afterAll(async () => {
    await SubscriptionsTeardown('Test Subscription Assignment')
    await app.close()
  })

  const testAll = test.each([
    ['a superadmin', () => superadminHeaders],
    ['an organisation admin', () => organisationAdminHeaders],
    ['a subscription admin', () => subscriptionAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  testAll(
    `POST /organisations/:organisationId/subscriptions/:subscriptionId/users assigning users to the subscriptions by organisationId should result in 201 created`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const org = await getOrganisationById(organisation.id)
      const usersforCheck = []
      org.teams.forEach(async (team) => {
        const result = await getSubscriptionTeam(
          'Test Subscription Assignment',
          team.id
        )
        usersforCheck.push(...result.users)
      })
      await getSubscriptionTeam('Test Subscription Assignment')
      const payload = { ...rest } as UpdateSubscriptionDto
      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/users`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
      const jsonResult = result.json()
      expect(Object.keys(jsonResult)).toEqual(
        expect.arrayContaining([
          'created_at',
          'updated_at',
          'id',
          'billing_entity',
          'billing_address_1',
          'billing_address_2',
          'billing_country',
          'billing_country_code',
          'billing_state',
          'billing_city',
          'billing_postcode',
          'type',
          'default',
          'organisation',
          'users'
        ])
      )
      expect(
        usersforCheck.every((user) => {
          const index = jsonResult.users.findIndex((userResult) => {
            userResult.id == user.id
          })
          return index > -1
        })
      ).toBeTruthy
    }
  )

  testAll(
    `POST /organisations/:organisationId/subscriptions/:subscriptionId/:teamId/users assigning users to the subscriptions by taemId should result in 201 created`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const payload = { ...rest } as UpdateSubscriptionDto
      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/${team.id}/users`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
      const jsonResult = result.json()
      expect(Object.keys(jsonResult)).toEqual(
        expect.arrayContaining([
          'created_at',
          'updated_at',
          'id',
          'billing_entity',
          'billing_address_1',
          'billing_address_2',
          'billing_country',
          'billing_country_code',
          'billing_state',
          'billing_city',
          'billing_postcode',
          'type',
          'default',
          'organisation',
          'users'
        ])
      )
      expect(
        team.users.every((userTeam) => {
          const index = jsonResult.users.findIndex((userResult) => {
            userResult.id == userTeam.id
          })
          return index > -1
        })
      ).toBeTruthy
    }
  )

  testAll(
    `POST /organisations/:organisationId/subscriptions/:subscriptionId/usersIds assigning users to the subscriptions with usersIds array (in payload) should result in 201 created`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const usersList = await getSubscriptionUsers(
        'Test Subscription Assignment'
      )
      const usersIdsList = usersList.map((user) => {
        return user.id
      })
      const payload = { ...rest, usersIdsList } as UpdateSubscriptionDto
      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/usersIds`,
        headers: getHeaders(),
        payload
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }
      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
      const jsonResult = result.json()
      expect(Object.keys(jsonResult)).toEqual(
        expect.arrayContaining([
          'created_at',
          'updated_at',
          'id',
          'billing_entity',
          'billing_address_1',
          'billing_address_2',
          'billing_country',
          'billing_country_code',
          'billing_state',
          'billing_city',
          'billing_postcode',
          'type',
          'default',
          'organisation',
          'users'
        ])
      )
      expect(
        usersIdsList.every((id) => {
          const index = jsonResult.users.findIndex((userResult) => {
            userResult.id == id
          })
          return index > -1
        })
      ).toBeTruthy
    }
  )

  testAll(
    `GET /organisations/:organisationId/subscriptions/:subscriptionId/users getting all subscription's users`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const result = await app.inject({
        method: 'GET',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/users`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(200)
      const jsonResult = Object.keys(result.json())
      expect(result.json()).not.toBeNull
      expect(jsonResult).toEqual(
        expect.arrayContaining(['results', 'page_total', 'total'])
      )
    }
  )

  testAll(
    `DELETE /organisations/:organisationId/subscriptions/:subscriptionId/users/:userId removing user from subscription`,
    async (type, getHeaders) => {
      const { organisation, id, users, ...rest } = subscription
      const result = await app.inject({
        method: 'DELETE',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/users/${users[1].id}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(200)
      expect(
        result.json()['users'].findIndex((user) => user.id == users[1].id)
      ).toEqual(-1)
    }
  )

  testAll(
    `DELETE /organisations/:organisationId/subscriptions/:subscriptionId/users/:userId trying to remove non-existent user from subscription`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = subscription
      const fakeUser = '22392f90-88b8-4d1b-a42b-eeeeeeeeeeee'
      const result = await app.inject({
        method: 'DELETE',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/users/${fakeUser}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      expect(result.statusCode).toEqual(400)
    }
  )
})

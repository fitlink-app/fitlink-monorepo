import { mockApp } from './helpers/app'
import { MockType } from './helpers/types'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Subscription } from '../src/modules/subscriptions/entities/subscription.entity'
import { getConnection } from 'typeorm'
import { SubscriptionsModule } from '../src/modules/subscriptions/subscriptions.module'
import { getAuthHeaders } from './helpers/auth'
import { User } from '../src/modules/users/entities/user.entity'
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service'

async function getSubscriptionsUsers() {
  const connection = getConnection()
  const repository = connection.getRepository(Subscription)
  return repository.find({
    relations: ['organisation', 'users']
  })
}

async function getUsers() {
  const connection = getConnection()
  const repository = connection.getRepository(User)
  return repository.find({
    take: 3,
  })
}

describe('ChargeBee', () => {
  let app: NestFastifyApplication
  let subscriptionAdminHeaders
  let authHeaders
  let seeded_subscription: Subscription
  let subscriptionsService: MockType<SubscriptionsService>

  beforeAll(async () => {
    app = await mockApp({
      imports: [SubscriptionsModule],
      providers: [],
      controllers: []
    })

    // Override services to return mock data
    subscriptionsService = app.get(SubscriptionsService)

    // Retrieve an subscription to test with
    const seed = await getSubscriptionsUsers()
    seeded_subscription = seed[Math.ceil(Math.random() * (seed.length - 1))]
    while(seeded_subscription.users.length < 1) {
      seeded_subscription = seed[Math.ceil(Math.random() * (seed.length - 1))]
    }
    // Subscription admin
    subscriptionAdminHeaders = getAuthHeaders({ s_a: [seeded_subscription.id] })
    // Auth user
    const users = await getUsers()
    authHeaders = getAuthHeaders(null, users[0].id)

  })


  const testSubAdmainAndUser = test.each([
    ['a subscription admin', () => subscriptionAdminHeaders],
    ['an authenticated user', () => authHeaders]
  ])

  const chargeBeePlan = [
      'id',
      'company',
      'auto_collection',
      'net_term_days',
      'allow_direct_debit',
      'created_at',
      'taxability',
      'updated_at',
      'pii_cleared',
      'resource_version',
      'deleted',
      'object',
      'billing_address',
      'card_status',
      'promotional_credits',
      'refundable_credits',
      'excess_payments',
      'unbilled_charges',
      'preferred_currency_code'
  ]
  const countUsersAnswer = {
    'countUsers': 3
  }
  const answer = {
    'customer':
      {
        'customer': {
          'id': 11,
          'company': 'test',
          'auto_collection': 'test',
          'net_term_days': 'test',
          'allow_direct_debit': 'test',
          'created_at': 'test',
          'taxability': 'test',
          'updated_at': 'test',
          'pii_cleared': 'test',
          'resource_version': 'test',
          'deleted': 'test',
          'object': 'test',
          'billing_address': 'test',
          'card_status': 'test',
          'promotional_credits': 'test',
          'refundable_credits': 'test',
          'excess_payments': 'test',
          'unbilled_charges': 'test',
          'preferred_currency_code': 'test'
      }
    }
  }
  const answerWithCountUsers = answer
  answerWithCountUsers['countUsers'] = 3

  testSubAdmainAndUser(
    `POST /organisations/:organisationId/subscriptions/:subscriptionId/billing getting the number of users for billing setup`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = seeded_subscription

      subscriptionsService.setupBilling = jest.fn()
      subscriptionsService.setupBilling.mockReturnValue(countUsersAnswer)


      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/billing`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      //expect(result.statusCode).toEqual(201)
      const jsonResult = Object.keys(result.json())
      expect(jsonResult).toEqual(expect.arrayContaining([
        'countUsers',
      ]))
    }
  )

  testSubAdmainAndUser(
    `POST /organisations/:organisationId/subscriptions/:subscriptionId/billing/chargebee getting the number of users for billing setup and creating chargebee plan`,
    async (type, getHeaders) => {
      const { organisation, id, ...rest } = seeded_subscription

      subscriptionsService.setupBilling = jest.fn()
      subscriptionsService.setupBilling.mockReturnValue(answerWithCountUsers)

      const result = await app.inject({
        method: 'POST',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/billing/chargebee`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      //expect(result.statusCode).toEqual(201)
      const jsonResult = Object.keys(result.json())
      expect(jsonResult).toEqual(expect.arrayContaining([
        'countUsers',
        'customer'
      ]))

      const customerResult = Object.keys(result.json()['customer']['customer'])
      expect(customerResult).toEqual(expect.arrayContaining(chargeBeePlan))
    }
  )


  testSubAdmainAndUser(
    `GET /organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId getting chargebee plan`,
    async (type, getHeaders) => {
      const customerId = 'AzyuIySYK0O6BOji'
      const { organisation, id, ...rest } = seeded_subscription

      subscriptionsService.getChargebeePlan = jest.fn()
      subscriptionsService.getChargebeePlan.mockReturnValue(answer['customer'])

      const result = await app.inject({
        method: 'GET',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/billing/${customerId}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

      //expect(result.statusCode).toEqual(200)
      const customerResult = Object.keys(result.json()['customer'])
      expect(customerResult).toEqual(expect.arrayContaining(chargeBeePlan))
    }
  )

  testSubAdmainAndUser(
    `DELETE /organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId getting chargebee plan`,
    async (type, getHeaders) => {
      const customerId = 'AzyuIySYK0O6BOji'
      const { organisation, id, ...rest } = seeded_subscription

      subscriptionsService.removeChargebeePlan = jest.fn()
      subscriptionsService.removeChargebeePlan.mockReturnValue(answer['customer'])

      const result = await app.inject({
        method: 'DELETE',
        url: `/subscriptions/organisations/${organisation.id}/subscriptions/${id}/billing/${customerId}`,
        headers: getHeaders()
      })

      if (type === 'an authenticated user') {
        expect(result.statusCode).toEqual(403)
        return
      }

     //expect(result.statusCode).toEqual(200)
      const customerResult = Object.keys(result.json()['customer'])
      expect(customerResult).toEqual(expect.arrayContaining(chargeBeePlan))
    }
  )

  afterAll(async () => {
    await app.close()
  })

})

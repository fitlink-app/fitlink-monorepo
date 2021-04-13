import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Subscription } from '../src/modules/subscriptions/entities/subscription.entity'
import { Connection, getConnection, Repository } from 'typeorm'
import { SubscriptionsModule } from '../src/modules/subscriptions/subscriptions.module'
import { getAuthHeaders } from './helpers/auth'
import { CreateSubscriptionDto } from '../src/modules/subscriptions/dto/create-subscription.dto'
import { UpdateSubscriptionDto } from '../src/modules/subscriptions/dto/update-subscription.dto'

describe('Subscriptions', () => {
  let app: NestFastifyApplication
  let seed: Subscription[]
  let connection: Connection
  let subscriptionRepository: Repository<Subscription>
  let data: Partial<Subscription & { userId: string }>[]

  beforeAll(async () => {
    app = await mockApp({
      imports: [SubscriptionsModule],
      providers: []
    })

    /** Load seeded data */
    connection = getConnection()
    subscriptionRepository = connection.getRepository(Subscription)
    seed = await subscriptionRepository.find()
    data = seed.map((each) => {
      return {
        userId: each.user.id,

        current_calories: 500,
        current_steps: 10000,
        current_floors_climbed: 5,
        current_water_litres: 1,
        current_sleep_hours: 7
      }
    })
  })

  it(`/POST (201) Trying to update goals entry with no data should result in 201 created`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)

    const result = await app.inject({
      method: 'POST',
      url: `/goals`,
      headers: userAuthHeaders
    })

    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

  it(`/POST (201) Trying to update goals entry with complete "current_" data should result in 201 created`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)
    const payload = {
      current_calories: userData.current_calories,
      current_steps: userData.current_steps,
      current_floors_climbed: userData.target_floors_climbed,
      current_water_litres: userData.current_water_litres,
      current_sleep_hours: userData.current_sleep_hours
    } as RecreateGoalsEntryDto

    const result = await app.inject({
      method: 'POST',
      url: `/goals`,
      headers: userAuthHeaders,
      payload
    })

    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

  it(`/POST (201) Trying to update goals entry with part "current_" data should result in 201 (partial fields are allowed)`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)
    const payload = {
      current_calories: userData.current_calories,
      current_steps: userData.current_steps,
      current_floors_climbed: userData.current_floors_climbed
    } as RecreateGoalsEntryDto

    const result = await app.inject({
      method: 'POST',
      url: `/goals`,
      headers: userAuthHeaders,
      payload
    })

    expect(result.statusCode).toEqual(201)
  })
})

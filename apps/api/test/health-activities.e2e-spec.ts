import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import { HealthActivitiesModule } from '../src/modules/health-activities/health-activities.module'
import { ProvidersModule } from '../src/modules/providers/providers.module'
import { ProvidersService } from '../src/modules/providers/providers.service'
import { FitbitService } from '../src/modules/providers/providers/fitbit/fitbit.service'
import { StravaService } from '../src/modules/providers/providers/strava/strava.service'
import { FitbitEventData } from '../src/modules/providers/types/fitbit'
import { StravaEventData } from '../src/modules/providers/types/strava'
import { User } from '../src/modules/users/entities/user.entity'
import { mockApp } from './helpers/app'
import stravaPayload from './helpers/stravaPayload'
import { MockType } from './helpers/types'
import { ProvidersSetup, ProvidersTeardown } from './seeds/providers.seed'
import { SportSetup, SportsTeardownWithId } from './seeds/sport.seed'
import fitbitActivitiesPayload from './helpers/fitbitActivitiesPayload'
import { Provider } from '../src/modules/providers/entities/provider.entity'
import CreateSports from '../database/seeds/sport.seed'

describe('Health Activities', () => {
  let app: NestFastifyApplication
  let stravaService: MockType<StravaService>
  let fitbitService: MockType<FitbitService>
  let providerService: MockType<ProvidersService>
  let userForStrava: User
  let userForFitbit: User

  beforeAll(async () => {
    app = await mockApp({
      imports: [ProvidersModule, HealthActivitiesModule],
      providers: []
    })
    await useSeeding()
    await runSeeder(CreateSports)

    userForStrava = await ProvidersSetup('StravaHealthActivityTest')
    userForFitbit = await ProvidersSetup('FitbitHealthActivityTest')

    console.log(userForFitbit)
    console.log(userForStrava)

    stravaService = app.get(StravaService)
    fitbitService = app.get(FitbitService)
    providerService = app.get(ProvidersService)
  })

  afterAll(async () => {
    await useSeeding()
    await ProvidersTeardown('StravaHealthActivityTest')
    await ProvidersTeardown('FitbitHealthActivityTest')
    await app.get(Connection).close()
    await app.close()
  })
  it('POST /providers/fitbit/webhook', async () => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: userForFitbit.id
      },
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: userForFitbit.id
      }
    ]

    providerService.findOne = jest.fn()
    providerService.findOne.mockReturnValue({
      user: { id: userForFitbit.id }
    } as Partial<Provider>)
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.getFreshFitbitToken.mockReturnValue(
      `SomethingThat Won't error out`
    )
    fitbitService.fetchActivitySummaryByDay = jest.fn()
    fitbitService.fetchActivitySummaryByDay.mockReturnValue(
      fitbitActivitiesPayload
    )
    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook'
    })

    data.json().forEach((result) => {
      expect(result.start_time).toBeDefined()
      expect(result.end_time).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.sport).toBeDefined()
      expect(result.points).toBeDefined()
    })
    expect(data.statusCode).toBe(204)
    expect(data.statusMessage).toBe('No Content')
  })

  it('POST /providers/fitbit/webhook Activity Overlapping Error', async () => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: userForFitbit.id
      },
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: userForFitbit.id
      }
    ]

    providerService.findOne = jest.fn()
    providerService.findOne.mockReturnValue({
      user: { id: userForFitbit.id }
    } as Partial<Provider>)
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.getFreshFitbitToken.mockReturnValue(
      `SomethingThat Won't error out`
    )
    fitbitService.fetchActivitySummaryByDay = jest.fn()
    fitbitService.fetchActivitySummaryByDay.mockReturnValue(
      fitbitActivitiesPayload
    )
    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook'
    })
    expect(data.json()[0].healthActivity).toBe(null)
    expect(data.json()[1].healthActivity).toBe(null)
  })

  it('POST /providers/strava/webhook', async () => {
    const mockPayload: StravaEventData = {
      aspect_type: 'create',
      event_time: 12039,
      object_id: 12309,
      object_type: 'activity',
      owner_id: 12309,
      subscription_id: 102938,
      updates: {}
    }

    providerService.getUserByOwnerId = jest.fn()
    providerService.getUserByOwnerId.mockReturnValue({
      user: { id: userForStrava.id }
    })
    stravaService.getStravaActivity = jest.fn()
    stravaService.getStravaActivity.mockReturnValue({
      ...stravaPayload
    })

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook'
    })

    const result = data.json()
    expect(result.start_time).toBeDefined()
    expect(result.end_time).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.sport).toBeDefined()
    expect(result.points).toBeDefined()
    expect(data.statusCode).toBe(201)
    expect(data.statusMessage).toBe('Created')
  })

  it('POST /providers/strava/webhook Activity Overlapping Error', async () => {
    const mockPayload: StravaEventData = {
      aspect_type: 'create',
      event_time: 12039,
      object_id: 12309,
      object_type: 'activity',
      owner_id: 12309,
      subscription_id: 102938,
      updates: {}
    }

    providerService.getUserByOwnerId = jest.fn()
    providerService.getUserByOwnerId.mockReturnValue({
      user: { id: userForStrava.id }
    })
    stravaService.getStravaActivity = jest.fn()
    stravaService.getStravaActivity.mockReturnValue({
      ...stravaPayload
    })

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook'
    })

    expect(data.json().healthActivity).toBe(null)
  })
})

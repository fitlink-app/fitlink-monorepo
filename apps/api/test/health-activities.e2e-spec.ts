import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { HealthActivitiesModule } from '../src/modules/health-activities/health-activities.module'
import { ProvidersModule } from '../src/modules/providers/providers.module'
import { ProvidersService } from '../src/modules/providers/providers.service'
import { StravaService } from '../src/modules/providers/providers/strava/strava.service'
import { StravaEventData } from '../src/modules/providers/types/strava'
import { User } from '../src/modules/users/entities/user.entity'
import { mockApp } from './helpers/app'
import stravaPayload from './helpers/stravaPayload'
import { MockType } from './helpers/types'
import { ProvidersSetup, ProvidersTeardown } from './seeds/providers.seed'
import { SportSetup, SportsTeardownWithId } from './seeds/sport.seed'

describe('Health Activities', () => {
  let app: NestFastifyApplication
  let stravaService: MockType<StravaService>
  let providerService: MockType<ProvidersService>
  let seededUser: User
  let sportId

  beforeAll(async () => {
    app = await mockApp({
      imports: [ProvidersModule, HealthActivitiesModule],
      providers: []
    })
    await useSeeding()

    const sport = await SportSetup({
      name: 'Hiking',
      name_key: 'hiking',
      plural: 'hikings',
      singular: 'hiking'
    })
    sportId = sport.id

    seededUser = await ProvidersSetup('StravaHealthActivityTest')

    stravaService = app.get(StravaService)
    providerService = app.get(ProvidersService)
  })

  afterAll(async () => {
    await useSeeding()
    await SportsTeardownWithId(sportId)
    await ProvidersTeardown('StravaHealthActivityTest')
    await app.get(Connection).close()
    await app.close()
  })

  it('Pleases', () => {
    expect(1).toBe(1)
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
      user: { id: seededUser.id }
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
    jest.spyOn(console, 'error').mockImplementation(() => {})

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
      user: { id: seededUser.id }
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
    expect(console.error).toHaveBeenCalled()
  })
})

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection, getConnection } from 'typeorm'
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
import fitbitActivitiesPayload from './helpers/fitbitActivitiesPayload'
import fitbitProfilePayload from './helpers/fitbitProfilePayload'
import { Provider } from '../src/modules/providers/entities/provider.entity'
import CreateSports from '../database/seeds/sport.seed'
import fitbitSleepPayload from './helpers/fitbitSleepPayload'
import { LeaguesModule } from '../src/modules/leagues/leagues.module'
import { LeaguesWithUsersAndEntriesSetup } from './seeds/leagues.seed'
import { UsersSetup } from './seeds/users.seed'

import { LeaderboardEntry } from '../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { FeedItem } from '../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedGoalType,
  FeedItemCategory,
  FeedItemType
} from '../src/modules/feed-items/feed-items.constants'
import { UserReachedReward } from './seeds/rewards.seed'
import { getAuthHeaders } from './helpers/auth'
import { UserRank } from '../src/modules/users/users.constants'
import { WebhookEventData } from '../src/modules/providers/types/webhook'
import { ProviderType } from '../src/modules/providers/providers.constants'

describe('Health Activities', () => {
  let app: NestFastifyApplication
  let stravaService: MockType<StravaService>
  let fitbitService: MockType<FitbitService>
  let providerService: MockType<ProvidersService>
  let connection: Connection
  let userForStrava: User
  let userForFitbit: User
  let userForEventEmitterTesting: User
  let spyConsole
  let users: User[]

  beforeAll(async () => {
    spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {})

    app = await mockApp({
      imports: [ProvidersModule, HealthActivitiesModule, LeaguesModule],
      providers: []
    })
    connection = getConnection()
    await useSeeding()
    await runSeeder(CreateSports)
    users = await UsersSetup('Test Users', 4)
    await LeaguesWithUsersAndEntriesSetup('Test Leagues', 2, users)

    userForStrava = await ProvidersSetup('StravaHealthActivityTest')
    userForFitbit = await ProvidersSetup('FitbitHealthActivityTest')
    userForEventEmitterTesting = await ProvidersSetup('EventEmitterTest')

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
    spyConsole.mockRestore()
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

    providerService.getUserByOwnerId = jest.fn()
    providerService.getUserByOwnerId.mockReturnValue({
      user: { id: userForFitbit.id }
    } as Partial<Provider>)

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
    fitbitService.fetchProfile = jest.fn()
    fitbitService.fetchProfile.mockReturnValue(fitbitProfilePayload)

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
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
    fitbitService.fetchProfile = jest.fn()
    fitbitService.fetchProfile.mockReturnValue(fitbitProfilePayload)
    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
    })
    expect(data.json()[0].healthActivity).toBe(null)
    expect(data.json()[1].healthActivity).toBe(null)
  })

  it('/providers/fitbit/webhook Sleep Logs Test', async () => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'sleep',
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

    fitbitService.fetchSleepLogByDay = jest.fn()
    fitbitService.fetchSleepLogByDay.mockReturnValue(fitbitSleepPayload)

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
    })

    expect(data.json().goalEntry).toBe(null)
  })

  it('/providers/fitbit/webhook Logging Sleep Data Dates are on the same date', async () => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'sleep',
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

    fitbitService.datesAreOnSameDay = jest.fn()
    fitbitService.datesAreOnSameDay.mockReturnValue(true)
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.getFreshFitbitToken.mockReturnValue(
      `SomethingThat Won't error out`
    )

    fitbitService.fetchSleepLogByDay = jest.fn()
    fitbitService.fetchSleepLogByDay.mockReturnValue(fitbitSleepPayload)

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
    })

    const result = data.json()
    expect(result.current_sleep_hours).toBeDefined()
    expect(result.current_steps).toBeDefined()
    expect(result.current_floors_climbed).toBeDefined()
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
    expect(console.error).toHaveBeenCalled()
  })

  it('Create a new healthActivity to test the Event Emitter', async (done) => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: users[0].id
      },
      {
        collectionType: 'activities',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: users[0].id
      }
    ]

    providerService.getUserByOwnerId = jest.fn()
    providerService.getUserByOwnerId.mockReturnValue({
      user: { id: users[0].id }
    } as Partial<Provider>)

    providerService.findOne = jest.fn()
    providerService.findOne.mockReturnValue({
      user: { id: userForEventEmitterTesting.id }
    } as Partial<Provider>)
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.getFreshFitbitToken.mockReturnValue(
      `SomethingThat Won't error out`
    )
    fitbitService.fetchActivitySummaryByDay = jest.fn()
    fitbitService.fetchActivitySummaryByDay.mockReturnValue(
      fitbitActivitiesPayload
    )
    fitbitService.fetchProfile = jest.fn()
    fitbitService.fetchProfile.mockReturnValue(fitbitProfilePayload)
    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
    })

    const entry = await connection
      .getRepository(LeaderboardEntry)
      .findOne({ where: { user: { id: users[0].id } } })
    const user = await connection.getRepository(User).findOne(users[0].id)
    const feedItem = await connection.getRepository(FeedItem).findOne({
      user: { id: users[0].id }
    })
    expect(feedItem.id).toBeDefined()
    expect(feedItem.category).toBeDefined()
    expect(feedItem.type).toBeDefined()
    expect(user.points_total).toBeGreaterThan(users[0].points_total)
    expect(entry.points).toBe(8301)
    done()
  })

  it('Creates a new sleep entry that has reached the target', async () => {
    const mockPayload: FitbitEventData[] = [
      {
        collectionType: 'sleep',
        date: '2020-06-01',
        ownerId: '184X36',
        ownerType: 'user',
        subscriptionId: users[2].id
      }
    ]

    providerService.findOne = jest.fn()
    providerService.findOne.mockReturnValue({
      user: { id: users[2].id }
    } as Partial<Provider>)

    providerService.getUserByOwnerId = jest.fn()
    providerService.getUserByOwnerId.mockReturnValue({
      user: { id: users[2].id }
    } as Partial<Provider>)

    fitbitService.datesAreOnSameDay = jest.fn()
    fitbitService.datesAreOnSameDay.mockReturnValue(true)
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.getFreshFitbitToken.mockReturnValue(
      `SomethingThat Won't error out`
    )

    fitbitService.fetchSleepLogByDay = jest.fn()
    fitbitService.fetchSleepLogByDay.mockReturnValue(fitbitSleepPayload)

    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities'
    })

    // Expect a feed item to be created.
    const feedItem = await connection.getRepository(FeedItem).findOne({
      where: {
        goal_type: FeedGoalType.SleepHours,
        user: { id: users[2].id }
      }
    })
    expect(feedItem.id).toBeDefined()
    expect(feedItem.goal_type).toBe('sleep_hours')
    expect(feedItem.category).toBe('my_goals')
    expect(feedItem.type).toBe('daily_goal_reached')
  })

  it('Test that feed Item is created when reward is unlocked', async () => {
    const user = await UserReachedReward('Attainable Reward C-', 1)
    const nextReward = await app.inject({
      method: 'GET',
      url: `/me/next-reward`,
      headers: getAuthHeaders({}, user.id)
    })
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
      user: { id: user.id }
    })
    stravaService.getStravaActivity = jest.fn()
    stravaService.getStravaActivity.mockReturnValue({
      ...stravaPayload
    })

    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook'
    })

    const feedItem = await connection.getRepository(FeedItem).findOne({
      where: {
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.RewardUnlocked,
        user: { id: user.id }
      },
      relations: ['reward']
    })

    expect(feedItem.id).toBeDefined()
    expect(feedItem.category).toBe('my_updates')
    expect(feedItem.type).toBe('reward_unlocked')
    expect(feedItem.reward.name).toBe(nextReward.json().reward.name)
    expect(feedItem.reward.id).toBe(nextReward.json().reward.id)
  })

  it('Test that a user is promoted when their active-minute-week is increased', async () => {
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
      user: { id: users[3].id }
    })
    stravaService.getStravaActivity = jest.fn()
    stravaService.getStravaActivity.mockReturnValue({
      ...stravaPayload
    })

    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook'
    })

    const user = await connection.getRepository(User).findOne(users[3].id)
    expect(user.rank).toBe(UserRank.Tier2)
    const feedItem = await connection.getRepository(FeedItem).findOne({
      where: {
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.TierUp,
        user,
        tier: UserRank.Tier2
      }
    })
    expect(feedItem).toBeDefined()
    expect(feedItem.id).toBeDefined()
  })

  it('POST /providers/webhook Allows manual entries from device (google fit, apple health)', async () => {
    // Provider service should be forced to return a matching provider.
    providerService.findOne.mockReturnValue({
      user: { id: '12345' }
    } as Partial<Provider>)

    const user = (await UsersSetup('Test health activities', 1))[0]

    const mockPayload: WebhookEventData = {
      activities: [
        {
          calories: 100,
          distance: 1000,
          provider: ProviderType.GoogleFit,
          end_time: new Date().toISOString(),
          start_time: new Date().toISOString(),
          utc_offset: 0,
          quantity: 1,
          type: 'walking'
        },
        {
          calories: 100,
          distance: 1000,
          provider: ProviderType.GoogleFit,
          end_time: new Date().toISOString(),
          start_time: new Date().toISOString(),
          utc_offset: 18000,
          quantity: 1,
          type: 'running'
        },
        {
          calories: 100,
          distance: 1000,
          provider: ProviderType.GoogleFit,
          end_time: new Date().toISOString(),
          start_time: new Date().toISOString(),
          utc_offset: -18000,
          quantity: 1,
          type: 'moonwalking'
        }
      ]
    }

    const result = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/webhook',
      headers: getAuthHeaders({}, user.id)
    })

    const activities = result.json()

    expect(activities.length).toBe(3)
    expect(activities[0].id).toBeDefined()
    expect(activities[1].id).toBeDefined()
    expect(activities[2].id).toBeUndefined()
  })
})

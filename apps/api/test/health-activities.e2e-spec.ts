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
import stravaPayload from './helpers/stravaPayload'
import { MockType } from './helpers/types'
import {
  ProvidersSetup,
  ProvidersTeardown,
  SeedProviderToUser
} from './seeds/providers.seed'
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
import { GoalsEntry } from '../src/modules/goals-entries/entities/goals-entry.entity'
import { UsersModule } from '../src/modules/users/users.module'
import { BfitDistributionProducerModule } from '../src/modules/bfit/bfit-producer.module'
import { BfitDistributionSenderService } from '../src/modules/bfit/bfit-producer.service'
import { ClientIdContextModule } from '../src/modules/client-id/client-id.module'
import { ContextId, ContextIdFactory, REQUEST } from '@nestjs/core'
import { CLIENT_ID } from '../src/modules/client-id/client-id'
import { mockApp } from './helpers/app'
import { Scope } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

describe('Health Activities', () => {
  let app: NestFastifyApplication
  let providerService: MockType<ProvidersService>
  let bfitDistributionSenderService: MockType<BfitDistributionSenderService>
  let connection: Connection
  let userForStrava: User
  let userForFitbit: User
  let userForEventEmitterTesting: User
  let spyConsole
  let users: User[]
  let contextId: ContextId

  beforeAll(async () => {
    spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {})

    app = await mockApp({
      imports: [
        ProvidersModule,
        HealthActivitiesModule,
        LeaguesModule,
        UsersModule,
        BfitDistributionProducerModule,
        ClientIdContextModule,
      ],
      providers: [],
      overrideProvider: [
        {
          provide: CLIENT_ID,
          scope: Scope.REQUEST,
          useFactory: (req: Request) => {
            const clientId = req?.headers[CLIENT_ID] || 'Fitlink';
            if (!req) {
              req = { headers: {} } as Request;
            }
            req['client'] = clientId;
            return clientId;
          },
          inject: [REQUEST],
        }
      ]
    })
    connection = getConnection()
    await useSeeding()
    await runSeeder(CreateSports)
    users = await UsersSetup('Test Users', 4)
    await LeaguesWithUsersAndEntriesSetup('Test Leagues', 2, users)

    bfitDistributionSenderService = app.get(BfitDistributionSenderService)
    bfitDistributionSenderService.sendToQueue = jest.fn();

    userForStrava = await ProvidersSetup('StravaHealthActivityTest')
    userForFitbit = await ProvidersSetup('FitbitHealthActivityTest')
    userForEventEmitterTesting = await ProvidersSetup('EventEmitterTest');

    contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    providerService = app.get(ProvidersService)

    await SeedProviderToUser(userForFitbit.id, 'fitbit')
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

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      if (fitbitService) {
        fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
          `SomethingThat Won't error out`
        )
        fitbitService.fetchActivitySummaryByDay = jest.fn().mockReturnValue(
          fitbitActivitiesPayload
        )
        fitbitService.fetchProfile = jest.fn().mockReturnValue(fitbitProfilePayload)
      } else {
        throw new Error('FitbitService is undefined')
      }


      return fitbitService;
    });


    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(FitbitService).then((fitbitService) => {
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
          `SomethingThat Won't error out`
        )
      fitbitService.fetchActivitySummaryByDay = jest.fn().mockReturnValue(
          fitbitActivitiesPayload
        )
      fitbitService.fetchProfile = jest.fn().mockReturnValue(fitbitProfilePayload)

      return fitbitService;
    });

    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
        `SomethingThat Won't error out`
      )
      fitbitService.fetchSleepLogByDay = jest.fn().mockReturnValue(fitbitSleepPayload)
      return fitbitService;
    });


    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      fitbitService.datesAreOnSameDay = jest.fn().mockReturnValue(true)
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
        `SomethingThat Won't error out`
      )
      fitbitService.fetchSleepLogByDay = jest.fn().mockReturnValue(fitbitSleepPayload)
      return fitbitService;
    });


    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.getStravaActivity = jest.fn().mockReturnValue({
        ...stravaPayload
      })
      return stravaService;
    });


    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.getStravaActivity = jest.fn().mockReturnValue({
        ...stravaPayload
      })
      return stravaService;
    });


    const data = await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
        `SomethingThat Won't error out`
      )
      fitbitService.fetchActivitySummaryByDay = jest.fn().mockReturnValue(
        fitbitActivitiesPayload
      )
      fitbitService.fetchProfile = jest.fn().mockReturnValue(fitbitProfilePayload)
      return fitbitService;
    });

    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      fitbitService.datesAreOnSameDay = jest.fn().mockReturnValue(true)
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(
        `SomethingThat Won't error out`
      )

      fitbitService.fetchSleepLogByDay = jest.fn().mockReturnValue(fitbitSleepPayload)
      return fitbitService;
    });


    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/fitbit/webhook/activities',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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

    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.getStravaActivity = jest.fn().mockReturnValue({
        ...stravaPayload
      })
      return stravaService;
    });


    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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


    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.getStravaActivity = jest.fn().mockReturnValue({
        ...stravaPayload
      })
      return stravaService;
    });

    await app.inject({
      method: 'POST',
      payload: mockPayload,
      url: '/providers/strava/webhook',
      headers: {
        [CLIENT_ID]: 'Fitlink'
      }
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
      headers: getAuthHeaders({}, user.id),
    })

    const activities = result.json()

    expect(activities.length).toBe(3)
    expect(activities[0].id).toBeDefined()
    expect(activities[1].id).toBeDefined()
    expect(activities[2].id).toBeUndefined()
  })

  it('POST /me/ping Updates Fitbit steps for qualifying users on ping from device', async () => {

    const emitter = app.get(EventEmitter2)

    emitter.emitAsync = jest.fn().mockImplementation(async (event, data) => {
      const fitbitService = await app.resolve(FitbitService).then((fitbitService) => {
        fitbitService.fetchActivitySummaryByDay = jest.fn().mockReturnValueOnce({
            summary: {
              steps: 1999
            }
        })
        fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue('token')
        return fitbitService;
      });

      fitbitService.onUserPingEvent(data);
    });

    await app.inject({
      method: 'PUT',
      payload: {},
      url: '/me/ping',
      headers: getAuthHeaders({}, userForFitbit.id)
    })

    const entry = await connection.getRepository(GoalsEntry).findOne({
      where: {
        user: { id: userForFitbit.id }
      },
      order: {
        updated_at: 'DESC'
      }
    })

    expect(entry.current_steps).toEqual(1999)
  })
})

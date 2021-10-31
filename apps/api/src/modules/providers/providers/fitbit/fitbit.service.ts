import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { tryAndCatch } from '../../../../helpers/tryAndCatch'
import * as fitbitClient from 'fitbit-node'
import { HealthActivityDto } from '../../../health-activities/dto/create-health-activity.dto'
import { healthActivityType } from '../../../health-activities/dto/healthActivityType'
import { lifestyleActivityType } from '../../../health-activities/dto/lifestyleActivityType'
import { HealthActivitiesService } from '../../../health-activities/health-activities.service'
import { ProviderType } from '../../providers.constants'
import { ProvidersService } from '../../providers.service'
import {
  FitbitActivity,
  FitbitActivityResponseBody,
  FitbitAuthResponse,
  FitbitEventData,
  FitbitSleepResponseBody,
  FitbitSubscriptionResponseBody,
  FitbitUserUpdates,
  LifestyleGoalActivityDTO
} from '../../types/fitbit'
import { FITBIT_ACTIVITY_TYPE_MAP } from '../constants'
import { GoalsEntriesService } from '../../../goals-entries/goals-entries.service'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../../users/entities/user.entity'
import { Repository } from 'typeorm'
import { addSeconds } from 'date-fns'

const FitbitApiClient: any = fitbitClient

@Injectable()
export class FitbitService {
  constructor(
    private providersService: ProvidersService,
    private configService: ConfigService,
    private healthActivityService: HealthActivitiesService,
    private goalsEntriesService: GoalsEntriesService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  Fitbit = new FitbitApiClient({
    clientId: this.configService.get('FITBIT_CLIENT_ID'),
    clientSecret: this.configService.get('FITBIT_CLIENT_SECRET'),
    apiVersion: this.configService.get('FITBIT_API_VERSION')
  })

  getOAuthUrl(userId: string) {
    return {
      oauth_url: this.Fitbit.getAuthorizeUrl(
        this.configService.get('FITBIT_SCOPES'),
        this.configService.get('FITBIT_CALLBACK_URL'),
        undefined,
        userId
      )
    }
  }

  async saveFitbitProvider(code: string, userId: string) {
    const tokenExchangeResult = await this.exchangeToken(code)
    await this.createPushSubscription(tokenExchangeResult.access_token, userId)
    const scopes = tokenExchangeResult.scope.split(' ')
    const token_expires_at = addSeconds(
      new Date(),
      tokenExchangeResult.expires_in
    )
    const result = await this.providersService.create(
      {
        provider_user_id: tokenExchangeResult.user_id,
        refresh_token: tokenExchangeResult.refresh_token,
        token: tokenExchangeResult.access_token,
        token_expires_at,
        scopes,
        type: ProviderType.Fitbit
      },
      userId
    )
    return result
  }

  async processPayload(payload: FitbitEventData[]) {
    const updatesByUser: FitbitUserUpdates = {}
    // Categorize updates by user
    for (const update of payload) {
      if (!updatesByUser[update.ownerId]) {
        updatesByUser[update.ownerId] = [update]
      } else {
        updatesByUser[update.ownerId].push(update)
      }
    }

    const payloadArray = Object.values(updatesByUser)

    /**
     * Loop through the payload entries by user in parallel.
     * Each userPayload is an array of updates
     */
    for (const userPayload of payloadArray) {
      // Get user's access token
      const provider = await this.providersService.getUserByOwnerId(
        userPayload[0].ownerId
      )

      // The user's removed themselves from Fitlink but the subscription still exists
      // (i.e. they still need to deauthorize themselves from the Fitlink Fitbit app)
      if (!provider) {
        console.log(`User with ownerId ${userPayload[0].ownerId} not found`)
        continue
      }

      const userId = provider.user.id

      const [token, tokenErr] = await tryAndCatch(
        this.getFreshFitbitToken(userId)
      )

      tokenErr && console.error(tokenErr.message)

      // Do not continue if there's no token available
      if (tokenErr) {
        continue
      }

      for (const update of userPayload) {
        switch (update.collectionType) {
          case 'activities':
            {
              const [summaryResult, summaryResultErr] = await tryAndCatch(
                this.fetchActivitySummaryByDay(token, update.date)
              )
              summaryResultErr && console.error(summaryResultErr)
              if (summaryResult.activities?.length) {
                const [resultsArr, resultsArrErr] = await tryAndCatch(
                  this.saveHealthActivities(
                    summaryResult.activities as FitbitActivity[],
                    userId
                  )
                )
                resultsArrErr && console.error(resultsArrErr)
                return resultsArr
              }
              if (this.datesAreOnSameDay(new Date(update.date), new Date())) {
                const lifestyleStats: LifestyleGoalActivityDTO = {
                  steps: summaryResult.summary.steps || 0,
                  floors_climbed: summaryResult.summary.floors || 0,
                  sleep_hours: 0,
                  water_litres: 0,
                  mindfulness: 0
                }
                await this.prcoessDailyGoalsHistory(userId, lifestyleStats)
              }
            }
            break

          case 'sleep': {
            const sleepLogs = await this.fetchSleepLogByDay(token, update.date)
            if (this.datesAreOnSameDay(new Date(update.date), new Date())) {
              const lifestyleStats: LifestyleGoalActivityDTO = {
                steps: 0,
                floors_climbed: 0,
                sleep_hours: sleepLogs.summary.totalMinutesAsleep / 60 || 0,
                water_litres: 0,
                mindfulness: 0
              }

              return await this.prcoessDailyGoalsHistory(userId, lifestyleStats)
            } else {
              return { goalEntry: null }
            }
          }

          default:
            return { success: true }
        }
      }
    }
  }

  async prcoessDailyGoalsHistory(
    userId: string,
    lifeStyleStats: LifestyleGoalActivityDTO
  ) {
    return await this.goalsEntriesService.createOrUpdate(userId, {
      current_floors_climbed: lifeStyleStats.floors_climbed,
      current_mindfulness_minutes: lifeStyleStats.mindfulness,
      current_sleep_hours: lifeStyleStats.sleep_hours,
      current_steps: lifeStyleStats.steps,
      current_water_litres: lifeStyleStats.water_litres
    })
  }

  async fetchSleepLogByDay(token: string, date: string) {
    const req = await this.Fitbit.get(`/sleep/date/${date}.json`, token)
    const body = req[0] as FitbitSleepResponseBody
    body.errors && console.error(body.errors[0].message)
    return body
  }

  async saveHealthActivities(activities: FitbitActivity[], userId: string) {
    const user = await this.usersRepository.findOne(userId)
    const promises = []
    for (const activity of activities) {
      const normalizedActivity = this.createNormalizedHealthActivity(
        activity,
        user
      )
      promises.push(
        this.healthActivityService.create(normalizedActivity, userId, activity)
      )
    }
    const results = await Promise.all(promises)
    return results
  }

  async fetchActivitySummaryByDay(token: string, date: string) {
    const req = await this.Fitbit.get(`/activities/date/${date}.json`, token)
    const body = req[0] as FitbitActivityResponseBody
    if (body.errors) {
      throw new BadRequestException(body.errors[0].message)
    }
    return body
  }

  datesAreOnSameDay(first: Date, second: Date) {
    const isOnSameDay =
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    return isOnSameDay
  }

  async deAuthorize(userId: string) {
    try {
      const accessToken = await this.getFreshFitbitToken(userId)
      await this.revokeToken(accessToken)
    } catch (e) {
      console.error(e)
    }

    await this.providersService.remove(userId, ProviderType.Fitbit)
    return true
  }

  // This is separated into it's own function so that it can be mocked in the tests.
  async revokeToken(token: string) {
    return await this.Fitbit.revokeAccessToken(token)
  }

  async exchangeToken(code: string): Promise<FitbitAuthResponse> {
    return await this.Fitbit.getAccessToken(
      code,
      this.configService.get('FITBIT_CALLBACK_URL')
    )
  }

  async refreshToken(accessToken: string, refreshToken: string) {
    try {
      const result = await this.Fitbit.refreshAccessToken(
        accessToken,
        refreshToken
      )
      return result
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async getFreshFitbitToken(userId: string) {
    const provider = await this.providersService.findOne(
      userId,
      ProviderType.Fitbit
    )
    if (!provider) {
      throw new NotFoundException(`Provider Not found`)
    }
    const now = new Date(Date.now())
    console.log(`Is FITBIT Token Expired: ${provider.token_expires_at < now}`)
    if (provider.token_expires_at < now) {
      const {
        refresh_token,
        access_token,
        expires_in
      }: FitbitAuthResponse = await this.refreshToken(
        provider.token,
        provider.refresh_token
      )
      const token_expires_at = addSeconds(new Date(), expires_in)
      const newCredentials = {
        token: access_token,
        refresh_token,
        token_expires_at
      }
      const updateResults = await this.providersService.update(
        userId,
        ProviderType.Fitbit,
        newCredentials
      )
      return updateResults.token
    } else {
      return provider.token
    }
  }

  verifyWebhook(verifyToken: string, type: string) {
    switch (type) {
      case 'default':
        return (
          verifyToken ===
          this.configService.get('FITBIT_VERIFY_WEBHOOK_DEFAULT')
        )
      case 'activities':
        return (
          verifyToken ===
          this.configService.get('FITBIT_VERIFY_WEBHOOK_ACTIVITIES')
        )
      case 'sleep':
        return (
          verifyToken === this.configService.get('FITBIT_VERIFY_WEBHOOK_SLEEP')
        )
      default:
        return false
    }
  }

  normalizeActivityType(activityName: string) {
    return FITBIT_ACTIVITY_TYPE_MAP[activityName] || 'unknown'
  }

  createNormalizedHealthActivity(
    activity: FitbitActivity,
    user: User
  ): HealthActivityDto {
    const end_time = new Date(
      new Date(activity.startTime).valueOf() + activity.duration
    ).toISOString()

    const type = this.normalizeActivityType(activity.activityName) as
      | healthActivityType
      | lifestyleActivityType

    const normalizedActivity: HealthActivityDto = {
      type,
      provider: ProviderType.Fitbit,
      start_time: activity.startTime,
      end_time,
      active_time: activity.activeDuration / 1000,
      calories: activity.calories,
      distance: activity.distance * 1000,
      elevation: 0
    }
    return normalizedActivity
  }

  async createPushSubscription(accessToken: string, subscribeeId: string) {
    try {
      // Replace this with the sub Id from fitbit dashboard
      const responses = await Promise.all([
        this.Fitbit.post(
          `/activities/apiSubscriptions/${subscribeeId}.json?subscriberId=activities`,
          accessToken
        ),
        this.Fitbit.post(
          `/sleep/apiSubscriptions/${subscribeeId}.json?subscriberId=sleep`,
          accessToken
        )
      ])

      for (const response of responses) {
        const body = response[0] as FitbitSubscriptionResponseBody
        if (body.errors) {
          console.error(body.errors[0].message)
          throw new BadRequestException(body.errors[0].message)
        }
      }
    } catch (e) {
      console.log(e.message)
      throw new BadRequestException(e.message)
    }
  }

  // Get all fitbit subscriptions
  async getFitbitSubscriptions(token: string) {
    const res = await this.Fitbit.get(
      `/activities/apiSubscriptions.json`,
      token
    )
    const body = res[0]
    if (body.errors) {
      console.error(body.errors[0].message)
    }
    return body
  }

  async deleteFitbitSubscription(token: string, subId: string) {
    const res = await this.Fitbit.delete(
      `/activities/apiSubscriptions/${subId}.json`,
      token
    )
    const body = res[0]
    return body
  }
}

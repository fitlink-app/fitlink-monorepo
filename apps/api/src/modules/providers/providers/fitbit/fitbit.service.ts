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
import { ProviderType } from '../../entities/provider.entity'
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

const FitbitApiClient: any = fitbitClient

// You'll get this from the dashboard every time you're trying to make a verification
const fitbit_verify_code =
  'fbc7cb5495f6268e3705bc1051726897e5d398c2a3caa3dbc5ff80df99c4a93f'

@Injectable()
export class FitbitService {
  constructor(
    private providersService: ProvidersService,
    private configService: ConfigService,
    private healthActivityService: HealthActivitiesService,
    private gaolsEntriesService: GoalsEntriesService
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
    const token_expires_at =
      new Date().valueOf() + tokenExchangeResult.expires_in * 1000
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
      if (!updatesByUser[update.subscriptionId]) {
        updatesByUser[update.subscriptionId] = [update]
      } else {
        updatesByUser[update.subscriptionId].push(update)
      }
    }

    const payloadArray = Object.values(updatesByUser)

    /**
     * Loop through the payload entries by user in parallel.
     * Each userPayload is an array of updates
     */
    for (const userPayload of payloadArray) {
      // Get user's access token
      const userId = userPayload[0].subscriptionId
      const [token, tokenErr] = await tryAndCatch(
        this.getFreshFitbitToken(userId)
      )
      tokenErr && console.error(tokenErr.message)

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
    return await this.gaolsEntriesService.createOrUpdate(userId, {
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
    const promises = []
    for (const activity of activities) {
      const normalizedActivity = this.createNormalizedHealthActivity(activity)
      promises.push(
        this.healthActivityService.create(normalizedActivity, userId)
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
    const accessToken = await this.getFreshFitbitToken(userId)
    await this.revokeToken(accessToken)
    await this.providersService.remove(userId, ProviderType.Fitbit)
    return { revoked_token: accessToken }
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
    return await this.Fitbit.refreshAccessToken(accessToken, refreshToken)
  }

  async getFreshFitbitToken(userId: string) {
    const provider = await this.providersService.findOne(
      userId,
      ProviderType.Fitbit
    )
    if (!provider) {
      throw new NotFoundException(`Provider Not found`)
    }
    let now = new Date(Date.now())
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
      const token_expires_at = new Date().valueOf() + expires_in * 1000
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

  verifyWebhook(verifyToken: string) {
    if (verifyToken !== fitbit_verify_code) {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND)
    }
  }

  normalizeActivityType(activityName: string) {
    return FITBIT_ACTIVITY_TYPE_MAP[activityName] || 'unknown'
  }

  createNormalizedHealthActivity(activity: FitbitActivity): HealthActivityDto {
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
      const subscriberId = 'sohailkhan'
      const responses = await Promise.all([
        this.Fitbit.post(
          `/activities/apiSubscriptions/${subscribeeId}.json?subscriberId=${subscriberId}`,
          accessToken
        )
      ])

      for (const response of responses) {
        const body = response[0] as FitbitSubscriptionResponseBody
        console.log(body)
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

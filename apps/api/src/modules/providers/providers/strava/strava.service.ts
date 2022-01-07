import {
  BadRequestException,
  HttpService,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  STRAVA_ACTIVITY_TYPE_MAP,
  STRAVA_AUTHORIZE_URL,
  STRAVA_DEAUTH_URL,
  STRAVA_TOKEN_EXCHANGE_URL
} from '../constants'
import { map } from 'rxjs/operators'
import { ProvidersService } from '../../providers.service'
import { ProviderType } from '../../providers.constants'
import { ConfigService } from '@nestjs/config'
import {
  StravaEventData,
  StravaCallbackResponse,
  StravaRefreshTokenResponse,
  StravaActivityType,
  StravaActivity
} from '../../types/strava'
import { healthActivityType } from '../../../health-activities/dto/healthActivityType'
import { lifestyleActivityType } from '../../../health-activities/dto/lifestyleActivityType'
import { HealthActivityDto } from '../../../health-activities/dto/create-health-activity.dto'
import { HealthActivitiesService } from '../../../health-activities/health-activities.service'
import { tryAndCatch } from '../../../../helpers/tryAndCatch'

@Injectable()
export class StravaService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private providersService: ProvidersService,
    private healthActivityService: HealthActivitiesService
  ) {}

  async processStravaData(stravaEventData: StravaEventData) {
    if (stravaEventData.object_type === 'activity') {
      switch (stravaEventData.aspect_type) {
        case 'create': {
          const provider = await this.providersService.getUserByOwnerId(
            stravaEventData.owner_id.toString()
          )
          const [result, resultErr] = await tryAndCatch(
            this.getStravaActivity(
              stravaEventData.object_id.toString(),
              provider.user.id
            )
          )
          resultErr && console.error(resultErr)

          const normalizedActivity = this.createNormalizedHealthActivity(result)
          const healthActivitySaveResult =
            await this.healthActivityService.create(
              normalizedActivity,
              provider.user.id,
              result
            )

          return healthActivitySaveResult
        }
        default:
          break
      }
    }
  }

  async getStravaActivity(activityId: string, userId: string) {
    const [accessToken, accessTokenErr] = await tryAndCatch(
      this.getFreshStravaAccessToken(userId)
    )
    accessTokenErr && console.error(accessTokenErr.message)
    const [activity, activityErr] = await tryAndCatch(
      this.httpService
        .get(`https://www.strava.com/api/v3/activities/${activityId}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          timeout: 3000
        })
        .pipe(map((response) => response.data))
        .toPromise()
    )
    activityErr && console.error(activityErr.message)
    return activity
  }

  stravaConfig(
    param:
      | 'id'
      | 'secret'
      | 'uri'
      | 'scopes'
      | 'verify_token'
      | 'webhook_callback_url'
  ) {
    const config = {
      id: this.configService.get('STRAVA_CLIENT_ID'),
      secret: this.configService.get('STRAVA_CLIENT_SECRET'),
      uri: this.configService.get('STRAVA_REDIRECT_URI'),
      scopes: this.configService.get('STRAVA_SCOPES'),
      verify_token: this.configService.get('STRAVA_VERIFY_STRING'),
      webhook_callback_url: this.configService.get(
        'STRAVA_WEBHOOK_CALLBACK_URL'
      )
    }
    return config[param]
  }

  getTokenUrl(code: string) {
    return `${STRAVA_TOKEN_EXCHANGE_URL}?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig(
      'secret'
    )}&grant_type=authorization_code&code=${code}`
  }

  async registerWebhook() {
    const url = `https://www.strava.com/api/v3/push_subscriptions?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig(
      'secret'
    )}&verify_token=${this.stravaConfig(
      'verify_token'
    )}&callback_url=${this.stravaConfig('webhook_callback_url')}`

    try {
      const result = await this.httpService
        .post(url, {
          headers: {
            accept: 'application/json'
          },
          timeout: 3000
        })
        .pipe(map((response) => response.data))
        .toPromise()

      return [result as { id: number }, null]
    } catch (e) {
      return [
        null,
        e.response.data.errors as {
          resource: string //'PushSubscription',
          field: string //'callback url',
          code: string //'not verifiable'
        }[]
      ]
    }
  }

  async deregisterWebhook(subscriptionId: string) {
    const url = `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig('secret')}`

    try {
      const result = await this.httpService
        .delete(url, {
          headers: {
            accept: 'application/json'
          },
          timeout: 3000
        })
        .pipe(map((response) => response.data))
        .toPromise()

      return [result, null]
    } catch (e) {
      return [
        null,
        e.response.data.errors as {
          resource: string //'PushSubscription',
          field: string //'callback url',
          code: string //'not verifiable'
        }[]
      ]
    }
  }

  async viewWebhook() {
    const url = `https://www.strava.com/api/v3/push_subscriptions?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig('secret')}`

    try {
      const result = await this.httpService
        .get(url, {
          headers: {
            accept: 'application/json'
          },
          timeout: 3000
        })
        .pipe(map((response) => response.data))
        .toPromise()
      return result[0] as {
        id: string
        callback_url: string
      }
    } catch (e) {
      console.error(e)
      throw new BadRequestException(e.response.data.errors)
    }
  }

  getRefreshTokenUrl(refresh_token: string) {
    return `${STRAVA_TOKEN_EXCHANGE_URL}?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig(
      'secret'
    )}&grant_type=refresh_token&refresh_token=${refresh_token}`
  }

  getOAuthUrl(userId: string) {
    return {
      oauth_url: [
        STRAVA_AUTHORIZE_URL,
        `?client_id=${this.stravaConfig('id')}`,
        `&client_secret=${this.stravaConfig('secret')}`,
        `&redirect_uri=${this.stravaConfig('uri')}`,
        `&scope=${this.stravaConfig('scopes')}`,
        `&response_type=code`,
        `&state=${userId}`
      ].join('')
    }
  }

  exchangeTokens(code: string): Promise<StravaCallbackResponse> {
    return this.httpService
      .post(this.getTokenUrl(code), {
        headers: {
          accept: 'application/json'
        },
        timeout: 3000
      })
      .pipe(map((response) => response.data))
      .toPromise()
  }

  async saveStravaProvider(code: string, userId: string, scope: any) {
    const scopes = scope ? scope.split(',') : []
    const { athlete, refresh_token, access_token, expires_at } =
      await this.exchangeTokens(code)

    const token_expires_at = new Date(Math.floor(expires_at * 1000))
    const result = await this.providersService.create(
      {
        provider_user_id: athlete.id,
        refresh_token,
        token: access_token,
        scopes,
        token_expires_at,
        type: ProviderType.Strava
      },
      userId
    )
    return result
  }
  async deAuthorize(userId: string) {
    try {
      const accessToken = await this.getFreshStravaAccessToken(userId)
      await this.revokeToken(accessToken)
    } catch (e) {
      console.error(e)
    }
    await this.providersService.remove(userId, ProviderType.Strava)
    return true
  }

  verifyWebhook(token: string, challenge: string) {
    if (token !== this.stravaConfig('verify_token')) {
      throw new BadRequestException(`Unauthorized request for verfication`)
    } else {
      return { 'hub.challenge': challenge }
    }
  }

  async revokeToken(access_token: string) {
    try {
      return await this.httpService
        .post(
          STRAVA_DEAUTH_URL,
          { access_token },
          {
            headers: {
              accept: 'application/json'
            },
            timeout: 3000
          }
        )
        .pipe(map((response) => response.data))
        .toPromise()
    } catch (err) {
      throw new BadRequestException(`Failed to revoke access`)
    }
  }

  async refreshToken(
    refresh_token: string
  ): Promise<StravaRefreshTokenResponse> {
    try {
      return await this.httpService
        .post(this.getRefreshTokenUrl(refresh_token), {
          headers: {
            accept: 'application/json'
          },
          timeout: 3000
        })
        .pipe(map((response) => response.data))
        .toPromise()
    } catch (e) {
      throw new BadRequestException(`Failed to refresh token`)
    }
  }

  /**
   *
   * @param userId
   * @returns an access token that isn't expired
   */
  async getFreshStravaAccessToken(userId: string) {
    // Get Strava Provider with the user Id
    const provider = await this.providersService.findOne(
      userId,
      ProviderType.Strava
    )
    if (!provider) {
      throw new NotFoundException(`Provider Not found`)
    }

    if (provider.token_error) {
      throw new BadRequestException(`User ${userId} has token error for Strava`)
    }

    const now = new Date()
    if (provider.token_expires_at < now) {
      // Token Expired Get New Token
      try {
        const { access_token, refresh_token, expires_at } =
          await this.refreshToken(provider.refresh_token)
        // Set the new credentials

        const newCredentials = {
          token: access_token,
          refresh_token,
          token_expires_at: new Date(Math.floor(expires_at * 1000))
        }

        const updateResults = await this.providersService.update(
          userId,
          ProviderType.Strava,
          newCredentials
        )

        return updateResults.token
      } catch (e) {
        await this.providersService.setProviderTokenError(
          userId,
          ProviderType.Strava
        )
        throw new BadRequestException(
          `Token could not be refreshed for ${userId}: ${ProviderType.Strava} `
        )
      }
    } else {
      return provider.token
    }
  }

  /**
   *
   * @param activityName Coming from strava this is gonna be included in our ACTIVITY_TYPE_MAP
   * @returns the name_key version of the activity so that we can query for it in the db.
   */
  normalizeActivityType(activityName: StravaActivityType) {
    return STRAVA_ACTIVITY_TYPE_MAP[activityName] || 'unknown'
  }

  createNormalizedHealthActivity(activity: StravaActivity): HealthActivityDto {
    const end_time = new Date(
      new Date(activity.start_date).valueOf() + activity.elapsed_time * 1000
    ).toISOString()

    const type = this.normalizeActivityType(activity.type) as
      | healthActivityType
      | lifestyleActivityType
      | 'unknown'

    const normalizedActivity: HealthActivityDto = {
      type,
      provider: ProviderType.Strava,
      start_time: activity.start_date,
      end_time,
      utc_offset: activity.utc_offset,
      calories: activity.calories,
      distance: activity.distance,
      elevation: activity.total_elevation_gain,
      active_time: activity.moving_time,
      title: activity.name
    }

    if (activity.map && activity.map.polyline) {
      normalizedActivity.polyline = activity.map.polyline
    }

    return normalizedActivity
  }
}

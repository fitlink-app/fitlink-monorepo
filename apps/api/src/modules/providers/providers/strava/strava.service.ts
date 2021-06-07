import {
  BadRequestException,
  HttpService,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  STRAVA_AUTHORIZE_URL,
  STRAVA_DEAUTH_URL,
  STRAVA_TOKEN_EXCHANGE_URL
} from '../constants'
import { map } from 'rxjs/operators'
import { ProvidersService } from '../../providers.service'
import { ProviderType } from '../../entities/provider.entity'
import { ConfigService } from '@nestjs/config'
import {
  StravaEventData,
  StravaCallbackResponse,
  StravaRefreshTokenResponse
} from '../../types/strava'

@Injectable()
export class StravaService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private providersService: ProvidersService
  ) {}

  processStravaData(stravaEventData: StravaEventData) {
    console.log(`Strava Events Data`, stravaEventData)
  }

  stravaConfig(param: 'id' | 'secret' | 'uri' | 'scopes' | 'verify_token') {
    const config = {
      id: this.configService.get('STRAVA_CLIENT_ID'),
      secret: this.configService.get('STRAVA_CLIENT_SECRET'),
      uri: this.configService.get('STRAVA_REDIRECT_URI'),
      scopes: this.configService.get('STRAVA_SCOPES'),
      verify_token: this.configService.get('STRAVA_VERIFY_STRING')
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

  getRefreshTokenUrl(refresh_token: string) {
    return `${STRAVA_TOKEN_EXCHANGE_URL}?client_id=${this.stravaConfig(
      'id'
    )}&client_secret=${this.stravaConfig(
      'secret'
    )}&grant_type=refresh_token&refresh_token=${refresh_token}`
  }

  getOAuthUrl(userId: string) {
    return {
      oauth_url: `${STRAVA_AUTHORIZE_URL}
    ?client_id=${this.stravaConfig('id')}
    &client_secret=${this.stravaConfig('secret')}
    &redirect_uri=${this.stravaConfig('uri')}
    &scope=${this.stravaConfig('scopes')}
    &response_type=code
    &state=${userId}`
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
    const {
      athlete,
      refresh_token,
      access_token,
      expires_at
    } = await this.exchangeTokens(code)

    const token_expires_at = expires_at * 1000
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
      const result = await this.revokeToken(accessToken)
      if (result) {
        await this.providersService.remove(userId, ProviderType.Strava)
      }
      return { revoked_token: result.access_token }
    } catch (err) {
      throw new BadRequestException(err.message)
    }
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

  async getFreshStravaAccessToken(userId: string) {
    // Get Strava Provider with the user Id
    const provider = await this.providersService.findOne(
      userId,
      ProviderType.Strava
    )
    if (!provider) {
      throw new NotFoundException(`Provider Not found`)
    }
    let now = new Date(Date.now())
    console.log(`Is Token Expired: ${provider.token_expires_at < now}`)
    if (provider.token_expires_at < now) {
      // Token Expired Get New Token
      const {
        access_token,
        refresh_token,
        expires_at
      } = await this.refreshToken(provider.refresh_token)
      // Set the new credentials

      const newCredentials = {
        token: access_token,
        refresh_token,
        // Without the * 1000 the year is always in the previous century I don't know why
        token_expires_at: expires_at * 1000
      }

      const updateResults = await this.providersService.update(
        userId,
        ProviderType.Strava,
        newCredentials
      )

      return updateResults.token
    } else {
      return provider.token
    }
  }
}

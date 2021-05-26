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
import { Observable } from 'rxjs'
import { ProviderType } from '../../entities/provider.entity'
import { AuthenticatedUser } from 'apps/api/src/models'

const client_id = '59872'
const client_secret = '657513b1852f65d2d5dac18ca08d77780e1cd5af'

export interface StravaCallbackResponse {
  expires_at: number
  refresh_token: string
  access_token: string
  athlete: {
    id: string
  }
}

export interface StravaRefreshTokenResponse {
  expires_at: number
  refresh_token: string
  access_token: string
}

@Injectable()
export class StravaService {
  constructor(
    private httpService: HttpService,
    private providersService: ProvidersService
  ) {}

  getOAuthUrl({ client_id, client_secret, redirect_uri, user }) {
    return `${STRAVA_AUTHORIZE_URL}
    ?client_id=${client_id}
    &client_secret=${client_secret}
    &redirect_uri=${redirect_uri}
    &scope=activity:read
    &response_type=code
    &state=${user.id}`
  }

  exchangeTokens(code: string): Observable<StravaCallbackResponse> {
    return this.httpService
      .post(this.getTokenUrl(code), {
        headers: {
          accept: 'application/json'
        },
        timeout: 3000
      })
      .pipe(map((response) => response.data))
  }

  async saveStravaProvider(code: string, userId: string, scope: any) {
    const scopes = scope ? scope.split(',') : []
    const {
      athlete,
      refresh_token,
      access_token,
      expires_at
    } = await this.exchangeTokens(code).toPromise()

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

  getTokenUrl(code: string) {
    return `${STRAVA_TOKEN_EXCHANGE_URL}?client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${code}`
  }

  getRefreshTokenUrl(refresh_token: string) {
    return `${STRAVA_TOKEN_EXCHANGE_URL}?client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token&refresh_token=${refresh_token}`
  }

  async deAuthorize(user: AuthenticatedUser) {
    try {
      const accessToken = await this.getFreshStravaAccessToken(user.id)
      const result = await this.revokeToken(accessToken)
      if (result) {
        await this.providersService.remove(user.id, ProviderType.Strava)
      }
      return { revoked_token: result.access_token }
    } catch (err) {
      throw new BadRequestException(err.message)
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

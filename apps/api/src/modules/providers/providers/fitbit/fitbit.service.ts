import {
  BadRequestException,
  HttpService,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { map } from 'rxjs/operators'
import * as fitbitClient from 'fitbit-node'
import { ProvidersService } from '../../providers.service'
import { ProviderType } from '../../entities/provider.entity'

const FitbitApiClient: any = fitbitClient

// const CLIENT_ID = '22BRK9'
// const CLIENT_SECRET = '2399fd219c1535c0a66ea090647f2a93'
//

const CLIENT_ID = '239ZNM'
const CLIENT_SECRET = '20a2f3cd13da77d0aa9e8934aeb47792'
const API_VERSION = '1.2'
const SCOPES = 'activity sleep nutrition'
const CALLBACK_URL = 'http://localhost:3001/api/v1/providers/fitbit/callback'

interface FitbitAuthResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  user_id: string
}

const Fitbit = new FitbitApiClient({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  apiVersion: API_VERSION
})

@Injectable()
export class FitbitService {
  constructor(private providersService: ProvidersService) {}

  getOAuthUrl(userId: string) {
    return Fitbit.getAuthorizeUrl(SCOPES, CALLBACK_URL, undefined, userId)
  }

  async saveFitbitProvider(code: string, userId: string) {
    const tokenExchangeResult = await this.exchangeToken(code)

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

  async deAuthorize(userId: string) {
    const accessToken = await this.getFreshFitbitToken(userId)
    await Fitbit.revokeAccessToken(accessToken)
    await this.providersService.remove(userId, ProviderType.Fitbit)
    return { revoked_token: accessToken }
  }

  async exchangeToken(code: string): Promise<FitbitAuthResponse> {
    return await Fitbit.getAccessToken(code, CALLBACK_URL)
  }

  async refreshToken(accessToken: string, refreshToken: string) {
    return await Fitbit.refreshAccessToken(accessToken, refreshToken)
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
}

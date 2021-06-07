import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fitbitClient from 'fitbit-node'
import { ProviderType } from '../../entities/provider.entity'
import { ProvidersService } from '../../providers.service'
import {
  FitbitAuthResponse,
  FitbitEventData,
  FitbitSubscriptionResponseBody
} from '../../types/fitbit'

const FitbitApiClient: any = fitbitClient

// You'll get this from the dashboard every time you're trying to make a verification
const fitbit_verify_code =
  'fbc7cb5495f6268e3705bc1051726897e5d398c2a3caa3dbc5ff80df99c4a93f'

@Injectable()
export class FitbitService {
  constructor(
    private providersService: ProvidersService,
    private configService: ConfigService
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

  proccessPayload(payload: FitbitEventData[]) {
    console.log(payload)
    return { success: true }
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

  async createPushSubscription(accessToken: string, subscriberId: string) {
    try {
      const responses = await Promise.all([
        this.Fitbit.post(
          `/activities/apiSubscriptions/${subscriberId}.json?subscriberId=SohailSubId`,
          accessToken
        )
      ])

      for (const response of responses) {
        const body = response[0] as FitbitSubscriptionResponseBody
        console.log(body)
        if (body.errors) {
          throw new BadRequestException(body.errors[0].message)
        }
      }
    } catch (e) {
      console.log(e)
      throw new BadRequestException(e.message)
    }
  }
}

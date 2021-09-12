import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { ProvidersModule } from '../src/modules/providers/providers.module'
import { FitbitService } from '../src/modules/providers/providers/fitbit/fitbit.service'
import { StravaService } from '../src/modules/providers/providers/strava/strava.service'
import { FitbitAuthResponse } from '../src/modules/providers/types/fitbit'
import { StravaCallbackResponse } from '../src/modules/providers/types/strava'
import { User } from '../src/modules/users/entities/user.entity'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { env } from './helpers/mocking'
import { parseQuery } from './helpers/parseQuery'
import { MockType } from './helpers/types'
import {
  ProvidersSetup,
  ProvidersTeardown,
  SeedProviderToUser
} from './seeds/providers.seed'
const {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI,
  STRAVA_SCOPES,
  FITBIT_CALLBACK_URL,
  FITBIT_CLIENT_ID,
  FITBIT_SCOPES
} = env

describe('Providers', () => {
  let app: NestFastifyApplication
  let stravaService: MockType<StravaService>
  let fitbitService: MockType<FitbitService>
  let seededUser: User
  let authHeaders

  beforeAll(async () => {
    app = await mockApp({
      imports: [ProvidersModule],
      providers: []
    })
    await useSeeding()

    seededUser = await ProvidersSetup('ProvidersTest')

    stravaService = app.get(StravaService)
    fitbitService = app.get(FitbitService)
    authHeaders = getAuthHeaders(null, seededUser.id)
  })

  afterAll(async () => {
    await ProvidersTeardown('ProvidersTest')
    await app.get(Connection).close()
    await app.close()
  })

  it('GET /providers/strava/auth Get OAuth URL', async () => {
    const data = await app.inject({
      url: `/providers/strava/auth`,
      method: 'GET',
      headers: authHeaders
    })
    let url = data.json().oauth_url
    url.split('\n').map((line: string, index: number) => {
      if (index === 0) {
        expect(line).toBe('https://www.strava.com/oauth/mobile/authorize')
      }
      if (index === 1) {
        expect(line.trim()).toBe(`?client_id=${STRAVA_CLIENT_ID}`)
      }
      if (index === 2) {
        expect(line.trim()).toBe(`&client_secret=${STRAVA_CLIENT_SECRET}`)
      }
      if (index === 3) {
        expect(line.trim()).toBe(`&redirect_uri=${STRAVA_REDIRECT_URI}`)
      }
      if (index === 4) {
        expect(line.trim()).toBe(`&scope=${STRAVA_SCOPES}`)
      }
      if (index === 5) {
        expect(line.trim()).toBe(`&response_type=code`)
      }
      if (index === 6) {
        expect(line.trim()).toBe(`&state=${seededUser.id}`)
      }
    })
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /providers/strava/callback', async () => {
    let stravaApiMockData = {
      access_token: 'access_token',
      athlete: { id: '210918' },
      expires_at: 1622455071943,
      refresh_token: 'refresh_token'
    }
    stravaService.exchangeTokens = jest.fn()
    stravaService.exchangeTokens.mockReturnValue(
      stravaApiMockData as StravaCallbackResponse
    )
    const data = await app.inject({
      method: 'GET',
      url: `/providers/strava/callback?code=10291823&state=${seededUser.id}&scope=${STRAVA_SCOPES}`
    })
    let result = data.json()
    expect(result.type).toBe('strava')
    expect(result.refresh_token).toBe(stravaApiMockData.refresh_token)
    expect(result.token).toBe(stravaApiMockData.access_token)
    expect(result.token_expires_at).toBe(
      new Date(stravaApiMockData.expires_at * 1000).toISOString()
    )
    expect(result.scopes[0]).toBe(STRAVA_SCOPES)
    expect(result.provider_user_id).toBe(stravaApiMockData.athlete.id)
    expect(result.user.id).toBe(seededUser.id)
    expect(result.id).toBeDefined()
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /providers/strava/revokeToken', async () => {
    const provider = await SeedProviderToUser(seededUser.id, 'strava')
    stravaService.getFreshStravaAccessToken = jest.fn()
    stravaService.revokeToken = jest.fn()
    stravaService.getFreshStravaAccessToken.mockReturnValue(provider.token)
    stravaService.revokeToken.mockReturnValue({ access_token: provider.token })
    const data = await app.inject({
      method: 'GET',
      url: `/providers/strava/revokeToken`,
      headers: authHeaders
    })

    expect(data.json().revoked_token).toBe(provider.token)
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /providers/fitbit/callback', async () => {
    const fitbitApiMockData: FitbitAuthResponse = {
      access_token: 'Access_token',
      expires_in: 28000,
      refresh_token: 'refresh_token',
      scope: FITBIT_SCOPES,
      user_id: '10298id'
    }

    fitbitService.exchangeToken = jest.fn()
    fitbitService.createPushSubscription = jest.fn()
    fitbitService.exchangeToken.mockReturnValue(fitbitApiMockData)
    const data = await app.inject({
      method: 'GET',
      url: `/providers/fitbit/callback?code=1012098123&state=${seededUser.id}`
    })
    let result = data.json()

    expect(result.type).toBe('fitbit')
    expect(result.refresh_token).toBe(fitbitApiMockData.refresh_token)
    expect(result.token).toBe(fitbitApiMockData.access_token)
    expect(result.scopes).toEqual(FITBIT_SCOPES.split(' '))
    expect(result.provider_user_id).toBe(fitbitApiMockData.user_id)
    expect(result.user.id).toBe(seededUser.id)
    expect(result.id).toBeDefined()
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /provider/fitbit/revokeToken', async () => {
    const provider = await SeedProviderToUser(seededUser.id, 'fitbit')
    fitbitService.getFreshFitbitToken = jest.fn()
    fitbitService.revokeToken = jest.fn()

    fitbitService.getFreshFitbitToken.mockReturnValue(provider.token)
    const data = await app.inject({
      method: 'GET',
      url: `/providers/fitbit/revokeToken`,
      headers: authHeaders
    })

    expect(data.json().revoked_token).toBe(provider.token)
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /providers/fitbit/auth/:userId', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/providers/fitbit/auth`,
      headers: authHeaders
    })

    let oauth_url = data.json().oauth_url.split('?')

    let query = {
      apiRoute: oauth_url[0],
      queryValues: oauth_url[1]
    }

    const parsedQueryValues = parseQuery(query.queryValues)
    expect(query.apiRoute).toBe('https://www.fitbit.com/oauth2/authorize')
    expect(parsedQueryValues.response_type).toBe('code')
    expect(parsedQueryValues.client_id).toBe(FITBIT_CLIENT_ID)
    expect(parsedQueryValues.scope).toBe(FITBIT_SCOPES)
    expect(parsedQueryValues.redirect_uri).toBe(FITBIT_CALLBACK_URL)
    expect(parsedQueryValues.state).toBe(seededUser.id)
  })

  it('GET /me/providers', async () => {
    await SeedProviderToUser(seededUser.id, 'fitbit')
    await SeedProviderToUser(seededUser.id, 'strava')
    const data = await app.inject({
      method: 'GET',
      headers: authHeaders,
      url: `/me/providers`
    })

    const firstResult = data.json()[0]
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
    expect(firstResult.id).toBeDefined()
    expect(firstResult.type).toBeDefined()
    expect(firstResult.refresh_token).toBeDefined()
  })

  it('POST /me/providers A user can create apple_healthkit or google_fit provider once only', async () => {
    const data = await app.inject({
      method: 'POST',
      headers: authHeaders,
      url: `/me/providers`,
      payload: {
        type: 'google_fit',
        token: 'token',
        refresh_token: 'token',
        token_expires_at: new Date().getTime(),
        scopes: ['read', 'write'],
        provider_user_id: '12345'
      }
    })

    const provider = data.json()

    expect(provider.id).toBeDefined()
    expect(provider.type).toEqual('google_fit')
    expect(provider.scopes).toEqual(['read', 'write'])

    const update = await app.inject({
      method: 'POST',
      headers: authHeaders,
      url: `/me/providers`,
      payload: {
        type: 'google_fit',
        token: 'token2',
        refresh_token: 'token2',
        token_expires_at: new Date().getTime(),
        scopes: ['read', 'write'],
        provider_user_id: '12345'
      }
    })

    const updateProvider = update.json()

    expect(updateProvider.id).toEqual(provider.id)
    expect(updateProvider.token).toEqual('token2')
  })

  it('DELETE /me/providers/:providerType A user can delete the provider', async () => {
    const providers = await getProviders()
    const fit = providers.filter((e) => e.type === 'google_fit')[0]
    expect(fit).toBeDefined()

    const del = await app.inject({
      method: 'DELETE',
      headers: authHeaders,
      url: `/me/providers/google_fit`
    })

    expect(del.statusCode).toEqual(200)

    const updatedProviders = await getProviders()
    expect(
      updatedProviders.filter((e) => e.type === 'google_fit')[0]
    ).toBeUndefined()

    async function getProviders() {
      const get = await app.inject({
        method: 'GET',
        headers: authHeaders,
        url: `/me/providers`
      })

      return get.json()
    }
  })
})

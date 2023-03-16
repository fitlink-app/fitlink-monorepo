import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Connection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { Provider } from '../src/modules/providers/entities/provider.entity'
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
import { ContextIdFactory, REQUEST } from '@nestjs/core'
import { CLIENT_ID } from '../src/modules/client-id/client-id'
import { Scope } from '@nestjs/common'
const {
  FITLINK_STRAVA_CLIENT_ID,
  FITLINK_STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI,
  STRAVA_SCOPES,
  FITLINK_FITBIT_CALLBACK_URL,
  FITLINK_FITBIT_CLIENT_ID,
  FITLINK_FITBIT_SCOPES
} = env

describe('Providers', () => {
  let app: NestFastifyApplication
  let seededUser: User
  let authHeaders
  let connection: Connection

  beforeAll(async () => {
    app = await mockApp({
      imports: [ProvidersModule],
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
    await useSeeding()

    connection = app.get(Connection)

    seededUser = await ProvidersSetup('ProvidersTest')

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
    const url = data.json().oauth_url || ''
    const parse = new URLSearchParams(url.substr(url.indexOf('?')))

    expect(parse.get('client_id')).toBe(FITLINK_STRAVA_CLIENT_ID)
    expect(parse.get('client_secret')).toBe(FITLINK_STRAVA_CLIENT_SECRET)
    expect(parse.get('redirect_uri')).toBe(STRAVA_REDIRECT_URI)
    expect(parse.get('scope')).toBe(STRAVA_SCOPES)
    expect(parse.get('response_type')).toBe('code')
    expect(parse.get('state')).toBe(seededUser.id)
    expect(url).toContain('https://www.strava.com/oauth/mobile/authorize')
    expect(data.statusCode).toBe(200)
    expect(data.statusMessage).toBe('OK')
  })

  it('GET /providers/strava/callback', async () => {
    const stravaApiMockData = {
      access_token: 'access_token',
      athlete: { id: '210918' },
      expires_at: 1622455071943,
      refresh_token: 'refresh_token'
    }

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.exchangeTokens = jest.fn();
      (stravaService.exchangeTokens as jest.Mock<any, any>).mockReturnValue(
        stravaApiMockData as StravaCallbackResponse
      )
      return stravaService;
    });

    const data = await app.inject({
      method: 'GET',
      url: `/providers/strava/callback?code=10291823&state=${seededUser.id}&scope=${STRAVA_SCOPES}`
    })

    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(
      'fitlink-app://provider/strava/auth-success'
    )

    const result = await connection.getRepository(Provider).findOne({
      where: {
        provider_user_id: '210918'
      },
      relations: ['user']
    })

    expect(result.type).toBe('strava')
    expect(result.refresh_token).toBe(stravaApiMockData.refresh_token)
    expect(result.token).toBe(stravaApiMockData.access_token)
    expect(result.scopes[0]).toBe(STRAVA_SCOPES)
    expect(result.provider_user_id).toBe(stravaApiMockData.athlete.id)
    expect(result.user.id).toBe(seededUser.id)
    expect(result.id).toBeDefined()
  })

  it('DELET /providers/strava', async () => {
    const provider = await SeedProviderToUser(seededUser.id, 'strava')


    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    await app.resolve(StravaService, contextId).then((stravaService) => {
      stravaService.getFreshStravaAccessToken = jest.fn().mockReturnValue(provider.token)
      stravaService.revokeToken = jest.fn().mockReturnValue({ access_token: provider.token })
      return stravaService;
    });


    const data = await app.inject({
      method: 'DELETE',
      url: `/providers/strava`,
      headers: authHeaders
    })
    expect(data.statusCode).toBe(200)
  })

  it('GET /providers/fitbit/callback', async () => {
    const fitbitApiMockData: FitbitAuthResponse = {
      access_token: 'Access_token',
      expires_in: 28000,
      refresh_token: 'refresh_token',
      scope: FITLINK_FITBIT_SCOPES,
      user_id: '10298id'
    }

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    await app.resolve(FitbitService, contextId).then((service) => {
      service.exchangeToken = jest.fn().mockReturnValue(fitbitApiMockData);
      service.createPushSubscription = jest.fn();
      return service;
    });

    const data = await app.inject({
      method: 'GET',
      url: `/providers/fitbit/callback?code=1012098123&state=${seededUser.id}`
    })

    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(
      'fitlink-app://provider/fitbit/auth-success'
    )

    const result = await connection.getRepository(Provider).findOne({
      where: {
        provider_user_id: '10298id'
      },
      relations: ['user']
    })

    expect(result.type).toBe('fitbit')
    expect(result.refresh_token).toBe(fitbitApiMockData.refresh_token)
    expect(result.token).toBe(fitbitApiMockData.access_token)
    expect(result.scopes).toEqual(FITLINK_FITBIT_SCOPES.split(' '))
    expect(result.provider_user_id).toBe(fitbitApiMockData.user_id)
    expect(result.user.id).toBe(seededUser.id)
    expect(result.id).toBeDefined()
    expect(data.statusCode).toBe(302)
  })

  it('DELETE /provider/fitbit', async () => {
    const provider = await SeedProviderToUser(seededUser.id, 'fitbit')
    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    await app.resolve(FitbitService, contextId).then((fitbitService) => {
      fitbitService.getFreshFitbitToken = jest.fn().mockReturnValue(provider.token)
      fitbitService.revokeToken = jest.fn()
      return fitbitService;
    });


    const data = await app.inject({
      method: 'DELETE',
      url: `/providers/fitbit`,
      headers: authHeaders
    })

    expect(data.statusCode).toBe(200)
  })

  it('GET /providers/fitbit/auth/:userId', async () => {
    const data = await app.inject({
      method: 'GET',
      url: `/providers/fitbit/auth`,
      headers: authHeaders
    })

    const oauth_url = data.json().oauth_url.split('?')

    const query = {
      apiRoute: oauth_url[0],
      queryValues: oauth_url[1]
    }

    const parsedQueryValues = parseQuery(query.queryValues)
    expect(query.apiRoute).toBe('https://www.fitbit.com/oauth2/authorize')
    expect(parsedQueryValues.response_type).toBe('code')
    expect(parsedQueryValues.client_id).toBe(FITLINK_FITBIT_CLIENT_ID)
    expect(parsedQueryValues.scope).toBe(FITLINK_FITBIT_SCOPES)
    expect(parsedQueryValues.redirect_uri).toBe(FITLINK_FITBIT_CALLBACK_URL)
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
        type: 'google_fit'
      }
    })

    const provider = data.json()

    expect(provider.id).toBeDefined()
    expect(provider.type).toEqual('google_fit')

    const update = await app.inject({
      method: 'POST',
      headers: authHeaders,
      url: `/me/providers`,
      payload: {
        type: 'google_fit'
      }
    })

    const updateProvider = update.json()
    expect(updateProvider.id).toEqual(provider.id)
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

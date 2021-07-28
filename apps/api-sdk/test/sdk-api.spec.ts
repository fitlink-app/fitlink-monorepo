import { ApiParameterError, AuthorizationRefreshError, makeApi } from '../index'
import {
  UpdateUserPasswordDto,
  UpdateUserEmailDto,
  UpdateUserAvatarDto
} from '../types'
import axios from 'axios'
import * as moxios from 'moxios'
import { readFile } from 'fs/promises'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { OrganisationType } from '@fitlink/api/src/modules/organisations/organisations.constants'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { League } from '@fitlink/api/src/modules/leagues/entities/league.entity'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'

import FormDataMocker = require('form-data')

// Mocks formdata and preserves TypeScript compatibility with browser version of FormData
const mockFormData = () => (new FormDataMocker() as unknown) as FormData

const api = makeApi(axios)

describe('list', () => {
  beforeEach(() => {
    moxios.install(axios)
  })

  afterEach(() => {
    moxios.uninstall(axios)
  })

  describe('api', () => {
    it("throws an error when parameters aren't passed correctly and the url is malformed", async () => {
      let error: ApiParameterError
      try {
        await api.get<Organisation>('/organisations/:organisationId', {
          organisation: '12345'
        })
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(ApiParameterError)
      expect(error.toString()).toContain(
        'URL parameter missing in /organisations/:organisationId'
      )
    })
  })

  describe('auth', () => {
    const tokens = {
      access_token: '11111',
      id_token: '22222',
      refresh_token: '33333'
    }
    const updatedTokens = {
      access_token: 'updated',
      refresh_token: 'updated',
      id_token: 'updated'
    }

    it('can signup', async () => {
      moxios.stubRequest('/auth/signup', {
        status: 200,
        response: {
          me: {
            id: '123'
          },
          auth: tokens
        }
      })

      const { auth, me } = await api.signUp({
        email: 'test',
        password: 'test'
      })

      expect(auth.access_token).toEqual('11111')
      expect(auth.id_token).toEqual('22222')
      expect(auth.refresh_token).toEqual('33333')
      expect(api.getTokens()).toEqual(tokens)
      expect(me.id).toEqual('123')
    })

    it('can log in and log out', async () => {
      moxios.stubRequest('/auth/login', {
        status: 200,
        response: tokens
      })

      const { access_token, id_token, refresh_token } = await api.login({
        email: 'test',
        password: 'test'
      })

      expect(access_token).toEqual('11111')
      expect(id_token).toEqual('22222')
      expect(refresh_token).toEqual('33333')
      expect(api.getTokens()).toEqual(tokens)

      moxios.stubRequest('/auth/logout', {
        status: 200,
        response: { success: true }
      })

      const { success } = await api.logout()

      expect(success).toEqual(true)
      expect(api.getTokens()).toEqual(null)
    })

    it('automatically refreshes the token when expired and replays the original request', async () => {
      // Set the original tokens, as if a user is resuming using an app
      api.setTokens(tokens)

      // Mock the auth refresh to return updated tokens
      moxios.stubRequest(/auth.*/, {
        status: 200,
        response: updatedTokens
      })

      // Mock that a request failed and returned a 401
      moxios.stubOnce('get', /organisations.*/, {})

      const stub = moxios.stubs.mostRecent()
      let count = 0
      Object.defineProperty(stub, 'response', {
        get: () => {
          if (count === 0) {
            count++
            return {
              status: 401,
              response: { message: 'Token expired' }
            }
          }
          return {
            status: 200,
            response: { results: [], page_total: 0, total: 0 }
          }
        }
      })

      const { results, page_total, total } = await api.list<Organisation>(
        '/organisations'
      )

      expect(results).toBeDefined()
      expect(page_total).toEqual(0)
      expect(total).toEqual(0)
      expect(api.getTokens()).toEqual(updatedTokens)
    })

    it('automatically refreshes the token when expired but rejects if cannot authorize after 1 attempt', async () => {
      // Set the original tokens, as if a user is resuming using an app
      // These could be stored in localStorage in the dashboard
      api.setTokens(tokens)

      // Mock the auth refresh to return updated tokens
      moxios.stubRequest(/auth.*/, {
        status: 400,
        response: { message: 'Invalid token' }
      })

      // Mock that a request failed and returned a 401
      moxios.stubOnce('get', /organisations.*/, {
        status: 401,
        response: { message: 'Token expired' }
      })

      try {
        await api.list<Organisation>('/organisations')
      } catch (err) {
        const error = err as AuthorizationRefreshError
        expect(error).toBeInstanceOf(AuthorizationRefreshError)
        expect(error.axiosError).toBeDefined()
        expect(error.toString()).toContain('AuthorizationRefreshError')
      }
    })

    it('throws an error when forbidden', async () => {
      api.unsetTokens()

      // Mock that a request failed and returned a 401
      moxios.stubOnce('get', /organisations.*/, {
        status: 401,
        response: { message: 'Forbidden' }
      })

      let error
      try {
        await api.list<Organisation>('/organisations')
      } catch (err) {
        error = err
      }

      expect(error.response.data.message).toEqual('Forbidden')
    })
  })

  it('can list items with pagination responses', async () => {
    moxios.stubOnce('get', /organisations\/111\/teams.*/, {
      status: 200,
      response: { results: [{ id: '333' }], page_total: 1, total: 1 }
    })

    moxios.stubOnce('get', /organisations\/111\/activities.*/, {
      status: 200,
      response: { results: [{ id: '222' }], page_total: 1, total: 1 }
    })

    moxios.stubOnce('get', /organisations.*/, {
      status: 200,
      response: { results: [{ id: '111' }], page_total: 1, total: 1 }
    })

    moxios.stubOnce('get', /me\/leagues.*/, {
      status: 200,
      response: { results: [{ id: '444' }], page_total: 1, total: 1 }
    })

    const organisations = await api.list<Organisation>('/organisations')
    const activities = await api.list<Activity>(
      '/organisations/:organisationId/activities',
      { organisationId: '111' }
    )
    const teams = await api.list<Team>('/organisations/:organisationId/teams', {
      organisationId: '111'
    })

    const myLeagues = await api.list<League>('/me/leagues')

    expect(organisations.results[0].id).toEqual('111')
    expect(activities.results[0].id).toEqual('222')
    expect(teams.results[0].id).toEqual('333')
    expect(myLeagues.results[0].id).toEqual('444')
  })

  it('can get items with entity responses', async () => {
    moxios.stubOnce('get', /organisations\/111$/, {
      status: 200,
      response: { id: '111' }
    })

    moxios.stubOnce('get', /organisations\/111\/activities\/222$/, {
      status: 200,
      response: { id: '222' }
    })

    moxios.stubOnce('get', /organisations\/111\/teams\/333$/, {
      status: 200,
      response: { id: '333' }
    })

    const organisation = await api.get<Organisation>(
      '/organisations/:organisationId',
      { organisationId: '111' }
    )
    const activity = await api.get<Activity>(
      '/organisations/:organisationId/activities/:activityId',
      { organisationId: '111', activityId: '222' }
    )
    const team = await api.get<Team>(
      '/organisations/:organisationId/teams/:teamId',
      { organisationId: '111', teamId: '333' }
    )

    expect(organisation.id).toEqual('111')
    expect(activity.id).toEqual('222')
    expect(team.id).toEqual('333')
  })

  it('can delete items', async () => {
    moxios.stubOnce('delete', /organisations\/111/, {
      status: 201,
      response: { affected: 1 }
    })

    moxios.stubOnce('delete', /organisations\/111\/activities\/222.*/, {
      status: 201,
      response: { affected: 1 }
    })

    moxios.stubOnce('delete', /organisations\/111\/teams\/333.*/, {
      status: 200,
      response: { affected: 1 }
    })

    const organisation = await api.delete('/organisations/:organisationId', {
      organisationId: '111'
    })
    const activity = await api.delete(
      '/organisations/:organisationId/activities/:activityId',
      { organisationId: '111', activityId: '222' }
    )
    const team = await api.delete(
      '/organisations/:organisationId/teams/:teamId',
      { organisationId: '111', teamId: '333' }
    )

    expect(organisation.affected).toEqual(1)
    expect(activity.affected).toEqual(1)
    expect(team.affected).toEqual(1)
  })

  it('can create items', async () => {
    moxios.stubOnce('post', /organisations\/111\/teams.*/, {
      status: 201,
      response: {
        id: '333'
      }
    })

    moxios.stubOnce('post', /organisations\/111\/activities.*/, {
      status: 201,
      response: {
        id: '222'
      }
    })

    moxios.stubOnce('post', /organisations.*/, {
      status: 201,
      response: {
        id: '111'
      }
    })

    const organisation = await api.post<Organisation>('/organisations', {
      payload: {
        name: 'Test',
        timezone: 'Etc/UTC',
        type: OrganisationType.School,
        email: 'test@example.com'
      }
    })

    const activity = await api.post<Activity>(
      '/organisations/:organisationId/activities',
      {
        organisationId: organisation.id,
        payload: {
          date: 'test',
          description: 'test',
          meeting_point: 'test',
          meeting_point_text: 'test',
          name: 'test'
        }
      }
    )

    const team = await api.post<Team>('/organisations/:organisationId/teams', {
      organisationId: organisation.id,
      payload: {
        name: 'Team'
      }
    })

    expect(organisation.id).toEqual('111')
    expect(activity.id).toEqual('222')
    expect(team.id).toEqual('333')
  })

  it('can update items', async () => {
    moxios.stubOnce('put', /organisations\/111\/teams\/333$/, {
      status: 200,
      response: {
        affected: 1
      }
    })

    moxios.stubOnce('put', /organisations\/111\/activities\/222$/, {
      status: 200,
      response: {
        affected: 1
      }
    })

    moxios.stubOnce('put', /organisations\/111$/, {
      status: 200,
      response: {
        affected: 1
      }
    })

    const organisation = await api.put<Organisation>(
      '/organisations/:organisationId',
      {
        organisationId: '111',
        payload: {
          name: 'Updated organisation',
          timezone: 'Etc/UTC',
          type: OrganisationType.School,
          email: 'test@example.com'
        }
      }
    )

    const activity = await api.put<Activity>(
      '/organisations/:organisationId/activities/:activityId',
      {
        organisationId: '111',
        activityId: '222',
        payload: {
          date: 'test',
          description: 'test',
          meeting_point: 'test',
          meeting_point_text: 'test',
          name: 'Updated activity'
        }
      }
    )

    const team = await api.put<Team>(
      '/organisations/:organisationId/teams/:teamId',
      {
        organisationId: '111',
        teamId: '333',
        payload: {
          name: 'Updated team'
        }
      }
    )

    expect(organisation.affected).toEqual(1)
    expect(activity.affected).toEqual(1)
    expect(team.affected).toEqual(1)
  })

  it('can upload images', async () => {
    moxios.stubOnce('post', /images$/, {
      status: 201,
      response: {
        url: 'https://example.com/imageurl'
      }
    })

    const file1 = await readFile(__dirname + '/assets/1200x1200.png')
    const formData = mockFormData()
    formData.append('image', (file1 as unknown) as Blob)
    formData.append('type', 'avatar')
    const image = await api.uploadFile<Image>('/images', {
      payload: formData
    })

    expect(image.url).toEqual('https://example.com/imageurl')
  })

  it('can upload imageId for user avatar', async () => {
    moxios.stubOnce('put', /me\/avatar/, {
      status: 200,
      response: { affected: 1 }
    })

    const image = await api.put<UpdateUserAvatarDto>('/me/avatar', {
      payload: {
        imageId: '123'
      }
    })

    expect(image.affected).toEqual(1)
  })

  it('can update password for user', async () => {
    moxios.stubOnce('put', /me\/password/, {
      status: 200,
      response: { affected: 1 }
    })

    const update = await api.put<UpdateUserPasswordDto>('/me/password', {
      payload: {
        current_password: 'test',
        new_password: 'test2'
      }
    })

    expect(update.affected).toEqual(1)
  })

  it('can update email for user', async () => {
    moxios.stubOnce('put', /me\/email/, {
      status: 200,
      response: { affected: 1 }
    })

    const update = await api.put<UpdateUserEmailDto>('/me/email', {
      payload: {
        email: 'test@example.com'
      }
    })

    expect(update.affected).toEqual(1)
  })
})

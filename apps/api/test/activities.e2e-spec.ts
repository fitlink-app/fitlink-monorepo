import { mockApp } from './helpers/app'
import { MockType } from './helpers/types'
// import { getAuthHeaders } from './helpers/auth'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ActivitiesModule } from '../src/modules/activities/activities.module'
import { ActivitiesIminService } from '../src/modules/activities/activities.imin.service'
import { ActivitiesService } from '../src/modules/activities/activities.service'
import { CreateActivityDto } from '../src/modules/activities/dto/create-activity.dto'
import { readFile } from 'fs/promises'
import FormData = require('form-data')

const activityColumns = [
  'id',
  'name',
  'meeting_point',
  'meeting_point_text',
  'description',
  'date',
  'cost',
  'created_at',
  'updated_at',
  'organizer_name',
  'organizer_url'
]

describe('Activities', () => {
  let app: NestFastifyApplication
  let activitiesIminService: MockType<ActivitiesIminService>
  let activitiesService: MockType<ActivitiesService>

  // Set auth headers
  // const headers = getAuthHeaders()
  // At the moment, activities service is exposed via bearer token
  // This will change when the app is fully migrated away from Firebase
  // stack and a JWT will be used instead.
  const headers = {
    authorization: 'Bearer fitlinkLeaderboardEntryToken'
  }

  beforeAll(async () => {
    app = await mockApp({
      imports: [ActivitiesModule],
      providers: []
    })

    // Override services to return mock data
    activitiesIminService = app.get(ActivitiesIminService)
    activitiesIminService.findAll = jest.fn()
    activitiesService = app.get(ActivitiesService)
  })

  afterAll(async () => {
    await app.close()
  })

  it(`GET /activities 200 Allows the fetching of merged paginated activities from local & imin service`, async () => {
    const page0 = await getPage('0', 20, 43, 20, 87) // 130 - 40   = 90 remaining
    const page1 = await getPage('1', 20, 43, 20, 87) // 90 - 40   = 50 remaining
    const page2 = await getPage('2', 3, 43, 20, 87) // 50 - 23  = 27 remaining
    const page3 = await getPage('3', 0, 43, 20, 87) // 27 - 40  = 0 remaining
    const page4 = await getPage('4', 0, 43, 7, 87) // ? - 0  = 0 remaining

    expect(page0).toEqual(90)
    expect(page1).toEqual(50)
    expect(page2).toEqual(27)
    expect(page3).toEqual(0)
    expect(page4).toEqual(0)

    async function getPage(
      page: string,
      pt1: number,
      t1: number,
      pt2: number,
      t2: number
    ) {
      const cacheFindAll = activitiesService.findAll

      activitiesService.findAll = jest.fn()
      activitiesService.findAll.mockReturnValue({
        results: Array.from({ length: pt1 }).map(() => ({ mock: true })),
        page_total: pt1,
        total: t1
      })

      activitiesIminService.findAll.mockReturnValue({
        results: Array.from({ length: pt2 }).map(() => ({ mock: true })),
        page_total: pt2,
        total: t2
      })

      const data = await app.inject({
        method: 'GET',
        url: '/activities',
        query: {
          geo_radial: '51.7520131,-1.2578499,5',
          page,
          limit: '20'
        },
        headers
      })

      activitiesService.findAll = cacheFindAll
      return data.json().remaining
    }
  })

  it(`GET /activities 200 Performs validation if geo_radial property is incorrectly formatted`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        geo_radial: '51.7520131,5',
        page: '0',
        limit: '20',
        with_imin: '1'
      },
      headers
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.message).toEqual([
      "geo_radial must be formatted correctly as 'lat,lng,radius'"
    ])
  })

  it(`GET /activities 200 Fetches real activities from the database, even when none are available from iMin`, async () => {
    activitiesIminService.findAll.mockReturnValue({
      results: [],
      page_total: 0,
      total: 0
    })

    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        geo_radial: '51.7520131,-1.2578499,5',
        page: '0',
        limit: '20'
      },
      headers
    })

    const result = Object.keys(data.json().results[0])

    expect(result).toEqual(expect.arrayContaining(activityColumns))
  })

  it(`GET /activities 200 Fetches real activities from the database ordered by created date and excludes imin`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        page: '0',
        limit: '20'
      },
      headers
    })

    const result = Object.keys(data.json().results[0])
    expect(result).toEqual(expect.arrayContaining(activityColumns))
  })

  it(`POST /activities 201 Creates a new activity with images`, async () => {
    const data = await createActivityWithImages()
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].url).toBeDefined()
    expect(data.json().images[1].url).toBeDefined()
  })

  it(`DELETE /activities 200 A created activity can be deleted`, async () => {
    const activityData = await createActivityWithImages()
    const id = activityData.json().id

    const data = await app.inject({
      method: 'DELETE',
      url: `/activities/${id}`,
      headers: {
        ...headers
      }
    })

    expect(data.statusCode).toEqual(200)
  })

  async function createActivityWithImages() {
    const payload: CreateActivityDto = {
      name: 'My new activity',
      description: 'Long text...',
      meeting_point: '51.7520131,-1.2578499',
      meeting_point_text: 'The place text',
      date: 'Monday at 5pm',
      organizer_name: 'Fitlink',
      organizer_url: 'https://fitlinkapp.com'
    }

    const form = new FormData()
    const file1 = await readFile(__dirname + '/assets/1200x1200.png')
    const file2 = await readFile(__dirname + '/assets/1416x721.png')

    form.append('images[]', file1)
    form.append('images[]', file2)

    Object.keys(payload).map((key: string) => {
      form.append(key, payload[key])
    })

    const data = await app.inject({
      method: 'POST',
      url: '/activities',
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })

    return data
  }
})

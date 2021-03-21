import { mockApp } from './helpers/app'
import { MockType } from './helpers/types'
import { getAuthHeaders } from './helpers/auth'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ActivitiesModule } from '../src/modules/activities/activities.module'
import { ActivitiesIminService } from '../src/modules/activities/activities.imin.service'
import { ActivitiesService } from '../src/modules/activities/activities.service'
import { intersection } from 'lodash'
import { CreateActivityDto } from '../src/modules/activities/dto/create-activity.dto'
import { readFile } from 'fs/promises'
import FormData = require('form-data')

describe('Activities', () => {
  let app: NestFastifyApplication
  let activitiesIminService: MockType<ActivitiesIminService>
  let activitiesService: MockType<ActivitiesService>

  // Set auth headers
  const headers = getAuthHeaders()

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

  it(`GET /activities 200 Allows the fetching of merged paginated activities from local & imin service`, async () => {
    const page0 = await getPage('0', 20, 43, 20, 87) // 130 - 40   = 90 remaining
    const page1 = await getPage('1', 20, 43, 20, 87) // 130 - 80   = 50 remaining
    const page2 = await getPage('2', 3, 43, 20, 87) // 130 - 103  = 27 remaining
    const page3 = await getPage('3', 0, 43, 20, 87) // 130 - 123  = 7 remaining
    const page4 = await getPage('4', 0, 43, 7, 87) // 130 - 130  = 0 remaining
    const page5 = await getPage('5', 0, 43, 0, 87) // 130 - ?    = 0 remaining

    expect(page0).toEqual(90)
    expect(page1).toEqual(50)
    expect(page2).toEqual(27)
    expect(page3).toEqual(7)
    expect(page4).toEqual(0)
    expect(page5).toEqual(0)

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

    const expected = [
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

    const result = Object.keys(data.json().results[0])

    expect(intersection(result, expected).length).toEqual(expected.length)
  })

  afterAll(async () => {
    await app.close()
  })

  it(`POST /activities 201 Creates a new activity with images`, async () => {
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
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].url).toBeDefined()
    expect(data.json().images[1].url).toBeDefined()
  })
})

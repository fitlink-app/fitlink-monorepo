import { mockApp } from './helpers/app'
import { MockType } from './helpers/types'
// import { getAuthHeaders } from './helpers/auth'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ActivitiesModule } from '../src/modules/activities/activities.module'
import { ActivitiesIminService } from '../src/modules/activities/activities.imin.service'
import { ActivitiesService } from '../src/modules/activities/activities.service'
import { CreateActivityDto } from '../src/modules/activities/dto/create-activity.dto'
import { readFile } from 'fs/promises'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import FormData = require('form-data')
import { ActivitiesSetup, ActivitiesTeardown } from './seeds/activities.seed'

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
  'organizer_url',
  'organizer_email',
  'organizer_telephone'
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

    // Run seed
    await useSeeding()
    await runSeeder(ActivitiesSetup)
  })

  afterAll(async () => {
    await runSeeder(ActivitiesTeardown)
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
        limit: '20',
        with_imin: '0'
      },
      headers
    })

    const result = Object.keys(data.json().results[0])
    expect(result).toEqual(expect.arrayContaining(activityColumns))
  })

  it(`GET /activities 200 Fetches real activities from the database with only two types`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        page: '0',
        limit: '20',
        with_imin: '0',
        type: 'group,class'
      },
      headers
    })

    data.json().results.map((each) => {
      expect(each.type == 'group' || each.type == 'class').toBe(true)
    })
  })

  it(`GET /activities 200 Fetches real activities from the database by keyword`, async () => {
    await createActivityWithImages(false, {
      name: 'EXTREME GYMING'
    })
    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        page: '0',
        limit: '20',
        with_imin: '0',
        type: 'group,class',
        keyword: 'extreme extreme'
      },
      headers
    })

    expect(data.json().results[0].name).toEqual('EXTREME GYMING')
  })

  it(`GET /activities 400 Throws error when incorrect activity type is queried`, async () => {
    const data = await app.inject({
      method: 'GET',
      url: '/activities',
      query: {
        page: '0',
        limit: '20',
        with_imin: '0',
        type: 'group,yoga'
      },
      headers
    })

    expect(data.statusCode).toEqual(400)
    expect(data.json().message).toContain('yoga does not exist')
  })

  it(`POST /activities 201 Creates a new activity with images`, async () => {
    const data = await createActivityWithImages()
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].url).toBeDefined()
    expect(data.json().images[1].url).toBeDefined()
  })

  it(`PUT /activities/:id 201 Updates an new activity with images and removes a single image`, async () => {
    const data = await createActivityWithImages()
    const json = data.json()
    const { form } = await getPayloadWithImages(true, {
      __deleteImages: [json.images[0].id].join(',')
    })

    await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: {
        ...headers,
        ...form.getHeaders()
      },
      payload: form
    })

    const get = await app.inject({
      method: 'GET',
      url: `/activities/${json.id}`,
      headers: {
        ...headers
      }
    })

    expect(get.json().images[0].url).toBeDefined()
    expect(get.json().images[1].url).toBeDefined()
    expect(get.json().images[2].url).toBeDefined()
    expect(get.json().images[3]).toBeUndefined()
  })

  it(`PUT /activities/:id 201 Updates an new activity with images and replaces existing images`, async () => {
    const data = await createActivityWithImages()
    const json = data.json()
    const form = await getFormWithFile({
      __replaceImages: '1'
    })

    await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: {
        ...headers,
        ...form.getHeaders()
      },
      payload: form
    })

    const get = await app.inject({
      method: 'GET',
      url: `/activities/${json.id}`,
      headers: {
        ...headers
      }
    })

    expect(get.json().images[0].url).toBeDefined()
    expect(get.json().images[1]).toBeUndefined()
  })

  it(`POST /activities 201 Creates a new activity with images including organizer image`, async () => {
    const data = await createActivityWithImages(true)
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].url).toBeDefined()
    expect(data.json().images[1].url).toBeDefined()
    expect(data.json().organizer_image.url).toBeDefined()
  })

  it(`POST /activities 400 Cannot create a new activity with incomplete fields`, async () => {
    const { form } = await getIncompletePayload()

    const data = await app.inject({
      method: 'POST',
      url: '/activities',
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })

    expect(data.statusCode).toEqual(400)
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

  async function createActivityWithImages(
    organizer = false,
    override: NodeJS.Dict<string> = {}
  ) {
    const { form } = await getPayloadWithImages(organizer, override)

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

  async function getPayloadWithImages(
    organizer = false,
    override: NodeJS.Dict<any> = {}
  ) {
    const payload: CreateActivityDto = {
      name: 'My new activity',
      description: 'Long text...',
      meeting_point: '51.7520131,-1.2578499',
      meeting_point_text: 'The place text',
      date: 'Monday at 5pm',
      organizer_name: 'Fitlink',
      organizer_url: 'https://fitlinkapp.com',
      organizer_email: 'info@fitlinkapp.com',
      organizer_telephone: '+44 10000000000000',
      ...override
    }

    const form = new FormData()
    const file1 = await readFile(__dirname + '/assets/1200x1200.png')
    const file2 = await readFile(__dirname + '/assets/1416x721.png')

    form.append('images[]', file1)
    form.append('images[]', file2)

    if (organizer) {
      const file3 = await readFile(__dirname + '/assets/900x611.png')
      form.append('organizer_image', file3)
    }

    Object.keys(payload).map((key: string) => {
      form.append(key, payload[key])
    })

    return {
      payload,
      form
    }
  }

  async function getIncompletePayload() {
    const { payload } = await getPayloadWithImages()
    const form = new FormData()
    Object.keys(payload).map((key: string) => {
      if (
        key in
        {
          organizer_url: '',
          organizer_email: '',
          organizer_telephone: ''
        }
      ) {
        form.append(key, '')
      } else {
        form.append(key, payload[key])
      }
    })
    return {
      payload,
      form
    }
  }

  async function getFormWithFile(payload: NodeJS.Dict<any> = {}) {
    const form = new FormData()
    const file = await readFile(__dirname + '/assets/1200x1200.png')
    form.append('images[]', file)
    Object.keys(payload).map((key: string) => {
      form.append(key, payload[key])
    })
    return form
  }
})

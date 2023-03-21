import { mockApp } from './helpers/app'
import { MockType } from './helpers/types'
import { getAuthHeaders } from './helpers/auth'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ActivitiesModule } from '../src/modules/activities/activities.module'
import { ActivitiesIminService } from '../src/modules/activities/activities.imin.service'
import { ActivitiesService } from '../src/modules/activities/activities.service'
import { CreateActivityDto } from '../src/modules/activities/dto/create-activity.dto'
import { readFile } from 'fs/promises'
import { Connection } from 'typeorm'
import { useSeeding } from 'typeorm-seeding'
import { User } from '../src/modules/users/entities/user.entity'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import FormData = require('form-data')
import { ActivitiesSetup, ActivitiesTeardown } from './seeds/activities.seed'
import { BfitDistributionModule } from '../src/modules/sqs/sqs.module'
import { SQSProducerModule } from '../src/modules/sqs/sqs-producer.module'
import { SQSDistributionSenderService } from '../src/modules/sqs/bfit-producer.service'
import { BfitDistributionService } from '../src/modules/sqs/sqs.service'

const activityColumns = [
  'id',
  'name',
  'meeting_point',
  'meeting_point_text',
  'description',
  'type',
  'date',
  'cost',
  'created_at',
  'updated_at',
  'organizer_name',
  'organizer_url',
  'organizer_email',
  'organizer_telephone'
]

const activityMapColumns = ['id', 'name', 'meeting_point', 'date', 'type']

describe('Activities', () => {
  let app: NestFastifyApplication
  let activitiesIminService: MockType<ActivitiesIminService>
  let sqsDistributionSenderService: MockType<SQSDistributionSenderService>
  let sqsDistributionService: MockType<BfitDistributionService>
  let activitiesService: MockType<ActivitiesService>
  let users: User[]
  let authHeaders: NodeJS.Dict<string>


  beforeAll(async () => {
    app = await mockApp({
      imports: [ActivitiesModule, BfitDistributionModule, SQSProducerModule],
      providers: []
    })

    await useSeeding()
    await ActivitiesSetup('Test activity')
    users = await UsersSetup('Test activity', 2)

    // User types
    authHeaders = getAuthHeaders({}, users[0].id)

    // Override services to return mock data
    activitiesIminService = app.get(ActivitiesIminService)
    sqsDistributionSenderService = app.get(SQSDistributionSenderService)
    sqsDistributionService = app.get(BfitDistributionService)
    sqsDistributionService.handleMessage = jest.fn()
    sqsDistributionSenderService.sendToQueue = jest.fn();
    activitiesIminService.findAll = jest.fn()
    activitiesIminService.findAllMarkers = jest.fn()
    activitiesService = app.get(ActivitiesService)
  })

  afterAll(async () => {
    await ActivitiesTeardown('Test activity')
    await UsersTeardown('Test activity')
    await app.get(Connection).close()
    await app.close()
  })

  // Skip this as Imin is currently disabled in our service
  it.skip(`GET /activities 200 Allows the fetching of merged paginated activities from local & imin service`, async () => {
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
        headers: authHeaders
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
      headers: authHeaders
    })

    const result = data.json()
    expect(data.statusCode).toEqual(400)
    expect(result.errors['geo_radial']).toEqual(
      "Geo_radial must be formatted correctly as 'lat,lng,radius'"
    )
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
      headers: authHeaders
    })

    const result = Object.keys(data.json().results[0])

    expect(result).toEqual(expect.arrayContaining(activityColumns))
  })

  it(`GET /activities/map 200 Fetches activities from the database for map, and always includes the users own activities`, async () => {
    await ActivitiesSetup('Test activity', 1, {
      meeting_point: {
        type: 'Point',
        coordinates: [51.7520131, -1.2578499]
      }
    })

    const others = await ActivitiesSetup('Test activity', 1, {
      meeting_point: {
        type: 'Point',
        coordinates: [0, -1]
      },
      owner: { id: users[0].id } as User
    })

    activitiesIminService.findAllMarkers.mockReturnValue({
      results: [],
      page_total: 0,
      total: 0
    })

    const data = await app.inject({
      method: 'GET',
      url: '/activities/map',
      query: {
        geo_radial: '51.7520131,-1.2578499,5'
      },
      headers: authHeaders
    })

    const result = Object.keys(data.json().results[0])
    const other = data.json().results.filter((e) => e.id === others[0].id)

    expect(result).toEqual(expect.arrayContaining(activityMapColumns))
    expect(other).toHaveLength(1)
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
      headers: authHeaders
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
      headers: authHeaders
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
      headers: authHeaders
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
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(400)
    expect(data.json().message).toContain('yoga does not exist')
  })

  it(`POST /activities 201 Creates a new activity with images`, async () => {
    const data = await createActivityWithImages()
    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].id).toBeDefined()
    expect(data.json().images[1].id).toBeDefined()
  })

  it(`POST /activities 400 Creates a new activity but validation fails`, async () => {
    const data = await createActivityWithImages(false, {
      name: '',
      description: ''
    })

    const json = data.json()
    expect(json.errors['name']).toEqual('This field is required')
    expect(json.errors['description']).toEqual('This field is required')
    expect(data.statusCode).toEqual(400)
  })

  it(`PUT /activities/:id 201 Updates an new activity with images and replaces existing images`, async () => {
    const data = await createActivityWithImages()
    const json = data.json()

    // Set the images correctly
    json.images = json.images[0].id

    // Don't update the meeting point
    delete json.meeting_point

    const put = await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: authHeaders,
      payload: json
    })

    expect(put.json().images[0].url).toBeDefined()
    expect(put.json().images[1]).toBeUndefined()
    expect(put.json().created_at).toBeDefined()

    const get = await app.inject({
      method: 'GET',
      url: `/activities/${json.id}`,
      headers: {
        ...authHeaders
      }
    })

    expect(get.json().images[0].url).toBeDefined()
    expect(get.json().images[1]).toBeUndefined()
  })

  it(`PUT /activities/:id 201 Updates an new activity without images and images are left intact`, async () => {
    const data = await createActivityWithImages(true)
    const json = data.json()

    const put = await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: {
        ...authHeaders
      },
      payload: {
        name: 'Test activity updated'
      }
    })

    expect(put.json().images[0].url).toBeDefined()
    expect(put.json().organizer_image.url).toBeDefined()
    expect(put.json().created_at).toBeDefined()
    expect(put.json().name).toEqual('Test activity updated')
  })

  it(`POST /activities 201 Creates a new activity with images including organizer image`, async () => {
    const data = await createActivityWithImages(true)

    expect(data.statusCode).toEqual(201)
    expect(data.json().name).toBeDefined()
    expect(data.json().images[0].id).toBeDefined()
    expect(data.json().images[1].id).toBeDefined()
    expect(data.json().organizer_image.id).toBeDefined()
  })

  it(`POST /activities 400 Cannot create a new activity with incomplete fields`, async () => {
    const payload = await getIncompletePayload()

    const data = await app.inject({
      method: 'POST',
      url: '/activities',
      payload,
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(400)
  })

  it(`DELETE /activities 200 A created activity can be deleted`, async () => {
    const activityData = await createActivityWithImages(true)
    const id = activityData.json().id

    const data = await app.inject({
      method: 'DELETE',
      url: `/activities/${id}`,
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(200)
  })

  it(`DELETE /activities 200 An activity created by a user can be deleted by that user`, async () => {
    const activityData = await createActivityWithImages(false, {
      user_id: '12345'
    })

    const id = activityData.json().id

    const data = await app.inject({
      method: 'DELETE',
      url: `/activities/${id}`,
      headers: authHeaders
    })
    expect(data.statusCode).toEqual(200)
  })

  it(`DELETE /activities 200 An activity image created by a user can be deleted by that user`, async () => {
    const activityData = await createActivityWithImages(true)

    let json = activityData.json()
    expect(json.organizer_image.id).toBeDefined()
    expect(json.images[0].id).toBeDefined()

    const deleteOrganizerImage = await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: authHeaders,
      payload: {
        organizer_image: null
      }
    })

    expect(deleteOrganizerImage.statusCode).toEqual(200)

    const data = await app.inject({
      method: 'GET',
      url: `/activities/${json.id}`,
      headers: authHeaders
    })

    json = data.json()
    expect(json.organizer_image).toBeNull()
    expect(json.images[0].id).toBeDefined()

    const deleteImages = await app.inject({
      method: 'PUT',
      url: `/activities/${json.id}`,
      headers: authHeaders,
      payload: {
        images: ''
      }
    })

    expect(deleteImages.statusCode).toEqual(200)

    const data2 = await app.inject({
      method: 'GET',
      url: `/activities/${json.id}`,
      headers: authHeaders
    })

    const json2 = data2.json()
    expect(json2.organizer_image).toBeNull()
    expect(json2.images).toEqual([])
  })

  it(`PUT /activities 201 An activity created by a user can be edited by that user`, async () => {
    const activityData = await createActivityWithImages(false)

    const id = activityData.json().id

    const data = await app.inject({
      method: 'PUT',
      url: `/activities/${id}`,
      headers: authHeaders,
      payload: {
        name: 'User Added Activity'
      }
    })

    expect(data.statusCode).toEqual(200)
  })

  it(`GET /me/activities 201 A user can list their own activities`, async () => {
    await createActivityWithImages(false)

    const data = await app.inject({
      method: 'GET',
      url: `/me/activities`,
      headers: authHeaders
    })

    expect(data.statusCode).toEqual(200)
    const result = Object.keys(data.json().results[0])
    expect(result).toEqual(
      expect.arrayContaining([
        ...activityColumns,
        'user_id',
        'organizer_image',
        'images'
      ])
    )
  })

  async function createActivityWithImages(
    organizer = false,
    override: NodeJS.Dict<string> = {}
  ) {
    const payload = await getPayloadWithImages(organizer, override)

    const data = await app.inject({
      method: 'POST',
      url: '/activities',
      payload,
      headers: authHeaders
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
      organizer_url: 'https://fitlinkteams.com',
      organizer_email: 'info@fitlinkapp.com',
      organizer_telephone: '+44 10000000000000',
      ...override
    }

    const image1 = await getImageUploadId()
    const image2 = await getImageUploadId()

    payload.images = [image1, image2].join(',')

    if (organizer) {
      payload.organizer_image = await getImageUploadId()
    }

    return payload
  }

  async function getIncompletePayload() {
    const payload = await getPayloadWithImages()
    Object.keys(payload).forEach((key: string) => {
      if (
        key in
        {
          organizer_url: '',
          organizer_email: '',
          organizer_telephone: ''
        }
      ) {
        payload[key] = ''
      }
    })

    return payload
  }

  async function getImageUploadId(headers = authHeaders) {
    const form = new FormData()
    const image = await readFile(__dirname + `/assets/1200x1200.png`)
    form.append('image', image)
    form.append('type', 'standard')

    const imageCreate = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    })

    return imageCreate.json().id
  }
})

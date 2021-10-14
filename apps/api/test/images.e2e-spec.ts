import { ImagesModule } from '../src/modules/images/images.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { readFile } from 'fs/promises'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import FormData = require('form-data')
import { Connection } from 'typeorm'
import { UsersSetup, UsersTeardown } from './seeds/users.seed'
import { useSeeding } from 'typeorm-seeding'
import { AuthModule } from '../src/modules/auth/auth.module'

/**
 * Images are tested using s3rver running inside docker
 * This is a local mock version of s3.
 */

describe('Image', () => {
  let app: NestFastifyApplication
  let file1: Buffer
  let file2: Buffer

  // Set auth headers
  let headers: NodeJS.Dict<string>
  let userId: string

  beforeAll(async () => {
    app = await mockApp({
      imports: [AuthModule, ImagesModule]
    })

    await useSeeding()
    const users = await UsersSetup('Test Users Image Upload')
    headers = getAuthHeaders({}, users[0].id)
    userId = users[0].id

    file1 = await readFile(__dirname + '/assets/1200x1200.png')
    file2 = await readFile(__dirname + '/assets/1416x721.png')
  })

  afterAll(async () => {
    await useSeeding()
    await UsersTeardown('Test Users Image Upload')
    await app.get(Connection).close()
    await app.close()
  })

  it(`POST /images 201 Allows the uploading of a single image`, async () => {
    const form = new FormData()

    form.append('any_file_name_works', file1)

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toContain('Created')
    expect(result.json().url).toBeDefined()
    expect(result.json().owner.id).toEqual(userId)
    expect(result.json().type).toEqual('standard')
  })

  it(`POST /images 201 Ignores other images and only uploads the first file, allows type to be set`, async () => {
    const form = new FormData()

    form.append('image', file1)
    form.append('other', file2)
    form.append('type', 'avatar')

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json().url).toBeDefined()
    expect(result.json().type).toEqual('avatar')
    expect(result.json().owner.id).toEqual(userId)
  })

  it(`POST /images 201 Ignores other images and only uploads the first file, allows type to be set`, async () => {
    const form = new FormData()

    form.append('image', file1)
    form.append('other', file2)
    form.append('type', 'avatar')

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    })

    expect(result.statusCode).toEqual(201)
    expect(result.json().url).toBeDefined()
    expect(result.json().type).toEqual('avatar')
    expect(result.json().owner.id).toEqual(userId)
  })

  it(`POST /images 400 Fails when type is incorrectly set`, async () => {
    const form = new FormData()

    form.append('image', file1)
    form.append('other', file2)
    form.append('type', 'other')

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    })

    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toEqual('Validation failed')
    expect(result.json().errors.type).toEqual('Invalid image type')
  })
})

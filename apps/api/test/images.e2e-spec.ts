import { ImagesModule } from '../src/modules/images/images.module'
import { mockApp } from './helpers/app'
import { getAuthHeaders } from './helpers/auth'
import { readFile } from 'fs/promises'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import FormData = require('form-data')
import { Connection } from 'typeorm'

/**
 * Images are tested using s3rver running inside docker
 * This is a local mock version of s3.
 */

describe('Image', () => {
  let app: NestFastifyApplication
  let file1: Buffer
  let file2: Buffer

  // Set auth headers
  const headers = getAuthHeaders()

  beforeAll(async () => {
    app = await mockApp({
      imports: [ImagesModule]
    })

    file1 = await readFile(__dirname + '/assets/1200x1200.png')
    file2 = await readFile(__dirname + '/assets/1416x721.png')
  })

  afterAll(async () => {
    await app.get(Connection).close()
    await app.close()
  })

  it(`POST /images 201 Allows the uploading of multiple images and only interprets specific fields`, async () => {
    const form = new FormData()

    form.append('images[]', file1)
    form.append('images[]', file2)

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toContain('Created')
    expect(result.json()[0]).toBeDefined()
    expect(result.json()[1]).toBeDefined()
    expect(result.json()[2]).toBeUndefined()
  })

  it(`POST /images 400 Fails when trying to upload an image with a field name that is unexpected`, async () => {
    const form = new FormData()

    form.append('images[]', file1)
    form.append('other[]', file2)

    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    })
    expect(result.statusCode).toEqual(400)
    expect(result.json().message).toContain('Unexpected file')
  })
})

import { ImagesModule } from '../src/modules/images/images.module'
import { mockApp } from './helpers/app'
import { readFile } from 'fs/promises'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import FormData = require('form-data')

const form = new FormData()

/**
 * Images are tested using s3rver running inside docker
 * This is a local mock version of s3.
 */

describe('Image', () => {
  let app: NestFastifyApplication
  let file: Buffer

  beforeAll(async () => {
    app = await mockApp({
      imports: [ImagesModule]
    })

    file = await readFile(__dirname + '/assets/1200x1200.png')
    form.append('image', file)
  })

  it(`POST /images 201 Allows the uploading of images`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/images',
      payload: form,
      headers: form.getHeaders()
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toContain('Created')
  })

  afterAll(async () => {
    await app.close()
  })
})

import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { QueueModule } from '../src/modules/queue/queue.module'
import { QueueService } from '../src/modules/queue/queue.service'
import { QueueablePayload } from '../src/models/queueable.model'
import { subSeconds } from 'date-fns'

describe('Queue', () => {
  let app: NestFastifyApplication
  let queueService: QueueService

  beforeAll(async () => {
    app = await mockApp({
      imports: [QueueModule]
    })

    queueService = app.get(QueueService)
    await queueService.clearQueue()
  })

  it(`Allows for the queueing of jobs`, async () => {
    const processAfter = subSeconds(new Date(), 1)
    const payload: QueueablePayload = {
      action: 'test',
      type: 'test',
      subject: 'test'
    }

    console.log(await queueService.queue(payload, processAfter))
    const result = await queueService.run()
    console.log(result.result[0])
    expect(result.total).toEqual(1)
  })
})

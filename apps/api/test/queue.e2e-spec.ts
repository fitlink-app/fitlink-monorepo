// Always initialize mockdate at the top, or the "Date" type is not consistent
import mockdate from 'mockdate'
const date = new Date()
mockdate.set(date)

import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { QueueModule } from '../src/modules/queue/queue.module'
import { QueueService } from '../src/modules/queue/queue.service'
import { QueueablePayload } from '../src/models/queueable.model'
import { addDays } from 'date-fns'
import { Queueables } from '../src/constants/queueables'

describe('Queue', () => {
  let app: NestFastifyApplication
  let queueService: QueueService

  const WORKER = 'test-worker'

  it(`Allows for the queueing of jobs and execution in future`, async () => {
    app = await mockApp({
      imports: [QueueModule]
    })

    queueService = app.get(QueueService)
    await queueService.clearQueue(WORKER)

    const processAfter = addDays(new Date(), 7)
    const payload: QueueablePayload = {
      action: Queueables.Test,
      type: 'test',
      subject: 'test'
    }

    await queueService.queue(payload, processAfter, WORKER)
    const result = await queueService.run(WORKER)

    expect(result.processed.length).toEqual(0)

    // Set the date into the future
    mockdate.set(addDays(new Date(), 8))

    const result2 = await queueService.run(WORKER)
    expect(result2.processed.length).toBeGreaterThanOrEqual(1)
    result2.processed.map((each) => {
      expect(each).toEqual([payload])
    })

    await app.close()
  })
})

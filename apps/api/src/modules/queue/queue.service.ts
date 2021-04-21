import { Injectable } from '@nestjs/common'
import { Queueable } from './entities/queueable.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { EventEmitter2 } from 'eventemitter2'
import { QueueablePayload } from '../../models/queueable.model'
import { OnQueue } from '../../decorators/onqueue.decorator'
import { Queueables } from '../../constants/queueables'

@Injectable()
export class QueueService {
  worker = 'default'

  constructor(
    @InjectRepository(Queueable)
    private readonly queueableRepository: Repository<Queueable>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Run all pending jobs
   *
   * @param string worker
   *
   */
  async run(worker = this.worker) {
    this.worker = worker
    const queuables = await this.getPendingJobs()

    // Ensure none of these queuables are called a second time
    // even if they eventually fail
    await Promise.all(
      queuables.map((queueable) => {
        queueable.completed = true
        return this.queueableRepository.save(queueable)
      })
    )

    // Cycle through queables
    const processed = await Promise.all(
      queuables.map(async (queueable) => {
        return this.eventEmitter.emitAsync(
          queueable.payload.action,
          queueable.payload
        )
      })
    )

    return {
      total: queuables.length,
      processed
    }
  }

  /**
   * Queue a job, by default processes soonest,
   * and with the default worker
   *
   * @returns boolean
   *
   */
  async queue(
    payload: QueueablePayload,
    process_after: Date = new Date(),
    worker = this.worker
  ) {
    const queueable = new Queueable()
    queueable.payload = payload
    queueable.worker = worker
    queueable.process_after = process_after
    return this.queueableRepository.save(queueable)
  }

  /**
   * Clear queue for default worker
   *
   */
  async clearQueue(worker = this.worker) {
    return this.queueableRepository
      .createQueryBuilder()
      .delete()
      .from(Queueable)
      .where('worker = :worker', {
        worker
      })
  }

  /**
   * Get pending jobs
   *
   */
  private getPendingJobs() {
    return this.queueableRepository.find({
      where: {
        process_after: LessThan(new Date()),
        completed: false,
        errored: false,
        worker: this.worker
      }
    })
  }

  /**
   * Test OnQueue listener
   *
   */
  @OnQueue(Queueables.Test)
  handleQueueEvent(payload: QueueablePayload) {
    return payload
  }
}

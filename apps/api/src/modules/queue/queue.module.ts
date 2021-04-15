import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Queueable } from './entities/queueable.entity'
import { QueueService } from './queue.service'

@Module({
  imports: [TypeOrmModule.forFeature([Queueable])],
  providers: [QueueService],
  exports: [QueueService]
})
export class QueueModule {}

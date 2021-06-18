import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Queueable } from '../queue/entities/queueable.entity'
import { QueueService } from '../queue/queue.service'
import { EmailService } from './email.service'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Queueable])],
  providers: [EmailService, QueueService],
  exports: [EmailService, QueueService]
})
export class CommonModule {}

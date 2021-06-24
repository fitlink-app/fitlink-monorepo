import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Queueable } from '../queue/entities/queueable.entity'
import { QueueService } from '../queue/queue.service'
import { EmailService, EmailServiceLocal } from './email.service'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Queueable])],
  providers: [
    QueueService,
    ConfigService,
    {
      provide: EmailService,

      // Mocks the email service for development / testing
      useFactory: (configService: ConfigService) => {
        if (configService.get('EMAIL_DEBUG') === '1') {
          return new EmailServiceLocal(configService)
        } else {
          return new EmailService(configService)
        }
      },
      inject: [ConfigService]
    }
  ],
  exports: [EmailService, QueueService, ConfigService]
})
export class CommonModule {}

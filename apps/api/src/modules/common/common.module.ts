import { Module, HttpModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesModule } from '../images/images.module'
import { ImagesService } from '../images/images.service'
import { Queueable } from '../queue/entities/queueable.entity'
import { QueueService } from '../queue/queue.service'
import { EmailService, EmailServiceLocal } from './email.service'
import { GoogleAnalyticsService } from './google-analytics.service'

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Queueable]),
    ImagesModule,
  ],
  providers: [
    QueueService,
    ImagesService,
    ConfigService,
    GoogleAnalyticsService,
    {
      provide: EmailService,

      // Mocks the email service for development / testing
      useFactory: (configService: ConfigService, googleAnalyticsService: GoogleAnalyticsService ) => {
        if (configService.get('EMAIL_DEBUG') === '1') {
          return new EmailServiceLocal(googleAnalyticsService)
        } else {
          return new EmailService(configService, googleAnalyticsService)
        }
      },
      inject: [ConfigService, GoogleAnalyticsService]
    }
  ],
  exports: [EmailService, QueueService, ConfigService, ImagesService]
})
export class CommonModule {}

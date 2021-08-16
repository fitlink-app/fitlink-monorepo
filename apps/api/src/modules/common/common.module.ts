import { Module, HttpModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesModule } from '../images/images.module'
import { ImagesService } from '../images/images.service'
import { Queueable } from '../queue/entities/queueable.entity'
import { QueueService } from '../queue/queue.service'
import { User } from '../users/entities/user.entity'
import { EmailService, EmailServiceLocal } from './email.service'
import { GoogleAnalyticsService } from './google-analytics.service'
import { CommonService } from './services/common.service'
import { StatsService } from './services/stats.service'
import { StatsController } from './stats.controller'

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Queueable, User]),
    ImagesModule
  ],
  controllers: [StatsController],
  providers: [
    CommonService,
    StatsService,
    QueueService,
    ImagesService,
    ConfigService,
    GoogleAnalyticsService,
    {
      provide: EmailService,

      // Mocks the email service for development / testing
      useFactory: (
        configService: ConfigService,
        googleAnalyticsService: GoogleAnalyticsService
      ) => {
        if (configService.get('EMAIL_DEBUG') === '1') {
          return new EmailServiceLocal(googleAnalyticsService)
        } else {
          return new EmailService(configService, googleAnalyticsService)
        }
      },
      inject: [ConfigService, GoogleAnalyticsService]
    }
  ],
  exports: [
    CommonService,
    EmailService,
    QueueService,
    ConfigService,
    ImagesService
  ]
})
export class CommonModule {}

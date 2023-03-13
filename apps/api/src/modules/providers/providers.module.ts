import { forwardRef, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './providers.controller'
import { StravaControler } from './providers/strava/strava.controller'
import { StravaService } from './providers/strava/strava.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Provider } from './entities/provider.entity'
import { User } from '../users/entities/user.entity'
import { FitbitController } from './providers/fitbit/fitbit.controller'
import { FitbitService } from './providers/fitbit/fitbit.service'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { HealthActivitiesModule } from '../health-activities/health-activities.module'
import { GoalsEntriesModule } from '../goals-entries/goals-entries.module'
import { WebhookController } from './providers/webhook/webhook.controller'
import { WebhookService } from './providers/webhook/webhook.service'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Module({
  imports: [
    ClientIdContextModule,
    HttpModule,
    forwardRef(() => HealthActivitiesModule),
    TypeOrmModule.forFeature([Provider, User]),
    ConfigModule,
    AuthModule,
    GoalsEntriesModule,
    EventEmitter2
  ],
  controllers: [
    ProvidersController,
    StravaControler,
    FitbitController,
    WebhookController
  ],
  providers: [ProvidersService, StravaService, FitbitService, WebhookService],
  exports: [ProvidersService]
})
export class ProvidersModule {}

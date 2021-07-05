import { forwardRef, HttpModule, Module } from '@nestjs/common'
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

@Module({
  imports: [
    HttpModule,
    forwardRef(() => HealthActivitiesModule),
    TypeOrmModule.forFeature([Provider, User]),
    ConfigModule,
    AuthModule,
    GoalsEntriesModule
  ],
  controllers: [ProvidersController, StravaControler, FitbitController],
  providers: [ProvidersService, StravaService, FitbitService],
  exports: [ProvidersService]
})
export class ProvidersModule {}

import { HttpModule, Module } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './providers.controller'
import { StravaControler } from './providers/strava/strava.controller'
import { StravaService } from './providers/strava/strava.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Provider } from './entities/provider.entity'
import { User } from '../users/entities/user.entity'
import { FitbitController } from './providers/fitbit/fitbit.controller'
import { FitbitService } from './providers/fitbit/fitbit.service'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Provider, User])],
  controllers: [ProvidersController, StravaControler, FitbitController],
  providers: [ProvidersService, StravaService, FitbitService]
})
export class ProvidersModule {}

import { forwardRef, Module } from '@nestjs/common'
import { HealthActivitiesService } from './health-activities.service'
import { HealthActivitiesController } from './health-activities.controller'
import { HealthActivitiesSubscriber } from './health-activities.subscriber'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HealthActivity } from './entities/health-activity.entity'
import { ProvidersModule } from '../providers/providers.module'
import { Sport } from '../sports/entities/sport.entity'
import { ImagesModule } from '../images/images.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthActivity, Sport]),
    forwardRef(() => ProvidersModule),
    ImagesModule
  ],
  controllers: [HealthActivitiesController],
  providers: [HealthActivitiesService, HealthActivitiesSubscriber],
  exports: [HealthActivitiesService]
})
export class HealthActivitiesModule {}

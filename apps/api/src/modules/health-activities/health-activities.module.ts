import { Module } from '@nestjs/common'
import { HealthActivitiesService } from './health-activities.service'
import { HealthActivitiesController } from './health-activities.controller'

@Module({
  controllers: [HealthActivitiesController],
  providers: [HealthActivitiesService]
})
export class HealthActivitiesModule {}

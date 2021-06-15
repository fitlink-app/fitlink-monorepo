import { Module } from '@nestjs/common'
import { HealthActivitiesService } from './health-activities.service'
import { HealthActivitiesController } from './health-activities.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HealthActivity } from './entities/health-activity.entity'
import { ProvidersModule } from '../providers/providers.module'
import { Sport } from '../sports/entities/sport.entity'

@Module({
  imports: [TypeOrmModule.forFeature([HealthActivity, Sport]), ProvidersModule],
  controllers: [HealthActivitiesController],
  providers: [HealthActivitiesService],
  exports: [HealthActivitiesService]
})
export class HealthActivitiesModule {}

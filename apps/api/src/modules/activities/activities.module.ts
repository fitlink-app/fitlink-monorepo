import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ActivitiesService } from './activities.service'
import { ActivitiesController } from './activities.controller'
import { ActivitiesIminService } from './activities.imin.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './entities/activity.entity'
import { ImagesModule } from '../images/images.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Activity]),
    ImagesModule
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesIminService]
})
export class ActivitiesModule {}

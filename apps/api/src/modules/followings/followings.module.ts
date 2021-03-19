import { Module } from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { FollowingsController } from './followings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Following } from './entities/following.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Following])],
  controllers: [FollowingsController],
  providers: [FollowingsService],
  exports: [
    TypeOrmModule.forFeature([Following]),
    FollowingsService
  ]
})
export class FollowingsModule {}

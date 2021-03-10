import { Module } from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { FollowingsController } from './followings.controller'

@Module({
  controllers: [FollowingsController],
  providers: [FollowingsService]
})
export class FollowingsModule {}

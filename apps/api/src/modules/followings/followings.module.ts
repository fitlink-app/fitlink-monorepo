import { FollowingsService } from './followings.service'
import { FollowingsController } from './followings.controller'
import { FollowingsSubscriber } from './followings.subscriber'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Following } from './entities/following.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { HttpModule, Module } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Following, User]),
    AuthModule,
    ConfigModule,
    HttpModule,
    CommonModule
  ],
  controllers: [FollowingsController],
  providers: [FollowingsService, FollowingsSubscriber],
  exports: [TypeOrmModule.forFeature([Following]), FollowingsService]
})
export class FollowingsModule {}

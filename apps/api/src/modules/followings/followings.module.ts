import { FollowingsService } from './followings.service'
import { FollowingsController } from './followings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Following } from './entities/following.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { HttpModule, Module } from '@nestjs/common'

@Module({
  imports: [
    TypeOrmModule.forFeature([Following]),
    AuthModule,
    ConfigModule,
    HttpModule,
  ],
  controllers: [FollowingsController],
  providers: [FollowingsService],
  exports: [
    TypeOrmModule.forFeature([Following]),
    FollowingsService
  ]
})
export class FollowingsModule {}

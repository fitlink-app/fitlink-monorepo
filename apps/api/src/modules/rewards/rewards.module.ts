import { forwardRef, Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { Reward } from './entities/reward.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { RewardsRedemption } from '../rewards-redemptions/entities/rewards-redemption.entity'
import { User } from '../users/entities/user.entity'
import { RewardClaimedListener } from './listeners/RewardClaimedListener'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FeedItemsModule } from '../feed-items/feed-items.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, RewardsRedemption, User]),
    // circualr dependency with user module for some reason this fixes it.
    forwardRef(() => AuthModule),
    EventEmitter2,
    FeedItemsModule
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardClaimedListener],
  exports: [RewardsService]
})
export class RewardsModule {}

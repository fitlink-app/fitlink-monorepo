import { forwardRef, Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { Reward } from './entities/reward.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { RewardsRedemption } from '../rewards-redemptions/entities/rewards-redemption.entity'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, RewardsRedemption, User]),
    // circualr dependency with user module for some reason this fixes it.
    forwardRef(() => AuthModule)
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService]
})
export class RewardsModule {}

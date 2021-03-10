import { Module } from '@nestjs/common'
import { RewardsRedemptionsService } from './rewards-redemptions.service'
import { RewardsRedemptionsController } from './rewards-redemptions.controller'

@Module({
  controllers: [RewardsRedemptionsController],
  providers: [RewardsRedemptionsService]
})
export class RewardsRedemptionsModule {}

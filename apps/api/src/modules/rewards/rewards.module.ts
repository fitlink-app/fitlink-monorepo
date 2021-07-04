import { Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { Reward } from './entities/reward.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), AuthModule],
  controllers: [RewardsController],
  providers: [RewardsService]
})
export class RewardsModule {}

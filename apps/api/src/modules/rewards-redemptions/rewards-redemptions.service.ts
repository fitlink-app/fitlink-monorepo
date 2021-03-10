import { Injectable } from '@nestjs/common'
import { CreateRewardsRedemptionDto } from './dto/create-rewards-redemption.dto'
import { UpdateRewardsRedemptionDto } from './dto/update-rewards-redemption.dto'

@Injectable()
export class RewardsRedemptionsService {
  create(createRewardsRedemptionDto: CreateRewardsRedemptionDto) {
    return 'This action adds a new rewardsRedemption'
  }

  findAll() {
    return `This action returns all rewardsRedemptions`
  }

  findOne(id: number) {
    return `This action returns a #${id} rewardsRedemption`
  }

  update(id: number, updateRewardsRedemptionDto: UpdateRewardsRedemptionDto) {
    return `This action updates a #${id} rewardsRedemption`
  }

  remove(id: number) {
    return `This action removes a #${id} rewardsRedemption`
  }
}

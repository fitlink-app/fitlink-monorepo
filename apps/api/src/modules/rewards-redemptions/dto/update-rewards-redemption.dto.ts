import { PartialType } from '@nestjs/mapped-types'
import { CreateRewardsRedemptionDto } from './create-rewards-redemption.dto'

export class UpdateRewardsRedemptionDto extends PartialType(
  CreateRewardsRedemptionDto
) {}

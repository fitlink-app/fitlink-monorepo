import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { RewardsRedemptionsService } from './rewards-redemptions.service'
import { CreateRewardsRedemptionDto } from './dto/create-rewards-redemption.dto'
import { UpdateRewardsRedemptionDto } from './dto/update-rewards-redemption.dto'

@Controller('rewards-redemptions')
export class RewardsRedemptionsController {
  constructor(
    private readonly rewardsRedemptionsService: RewardsRedemptionsService
  ) {}

  @Post()
  create(@Body() createRewardsRedemptionDto: CreateRewardsRedemptionDto) {
    return this.rewardsRedemptionsService.create(createRewardsRedemptionDto)
  }

  @Get()
  findAll() {
    return this.rewardsRedemptionsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewardsRedemptionsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateRewardsRedemptionDto: UpdateRewardsRedemptionDto
  ) {
    return this.rewardsRedemptionsService.update(
      +id,
      updateRewardsRedemptionDto
    )
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rewardsRedemptionsService.remove(+id)
  }
}

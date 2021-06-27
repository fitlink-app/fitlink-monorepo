import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { RewardsRedemptionsService } from './rewards-redemptions.service'
import { CreateRewardsRedemptionDto } from './dto/create-rewards-redemption.dto'
import { UpdateRewardsRedemptionDto } from './dto/update-rewards-redemption.dto'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

@Controller('rewards-redemptions')
export class RewardsRedemptionsController {
  constructor(
    private readonly rewardsRedemptionsService: RewardsRedemptionsService
  ) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createRewardsRedemptionDto: CreateRewardsRedemptionDto) {
    return this.rewardsRedemptionsService.create(createRewardsRedemptionDto)
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll() {
    return this.rewardsRedemptionsService.findAll()
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string) {
    return this.rewardsRedemptionsService.findOne(+id)
  }

  @Put(':id')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.rewardsRedemptionsService.remove(+id)
  }
}

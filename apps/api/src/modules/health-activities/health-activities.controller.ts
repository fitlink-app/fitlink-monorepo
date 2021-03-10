import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { HealthActivitiesService } from './health-activities.service'
import { CreateHealthActivityDto } from './dto/create-health-activity.dto'
import { UpdateHealthActivityDto } from './dto/update-health-activity.dto'

@Controller('health-activities')
export class HealthActivitiesController {
  constructor(
    private readonly healthActivitiesService: HealthActivitiesService
  ) {}

  @Post()
  create(@Body() createHealthActivityDto: CreateHealthActivityDto) {
    return this.healthActivitiesService.create(createHealthActivityDto)
  }

  @Get()
  findAll() {
    return this.healthActivitiesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthActivitiesService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateHealthActivityDto: UpdateHealthActivityDto
  ) {
    return this.healthActivitiesService.update(+id, updateHealthActivityDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthActivitiesService.remove(+id)
  }
}

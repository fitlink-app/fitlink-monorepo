import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common'
import { Public } from '../../decorators/public.decorator'
import { UpdateHealthActivityDto } from './dto/update-health-activity.dto'
import { HealthActivitiesService } from './health-activities.service'

@Controller('health-activities')
export class HealthActivitiesController {
  constructor(
    private readonly healthActivitiesService: HealthActivitiesService
  ) {}

  @Get()
  findAll() {
    return this.healthActivitiesService.findAll()
  }

  @Public()
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

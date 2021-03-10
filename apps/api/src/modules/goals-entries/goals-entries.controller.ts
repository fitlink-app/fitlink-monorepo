import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { CreateGoalsEntryDto } from './dto/create-goals-entry.dto'
import { UpdateGoalsEntryDto } from './dto/update-goals-entry.dto'

@Controller('goals-entries')
export class GoalsEntriesController {
  constructor(private readonly goalsEntriesService: GoalsEntriesService) {}

  @Post()
  create(@Body() createGoalsEntryDto: CreateGoalsEntryDto) {
    return this.goalsEntriesService.create(createGoalsEntryDto)
  }

  @Get()
  findAll() {
    return this.goalsEntriesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalsEntriesService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalsEntryDto: UpdateGoalsEntryDto
  ) {
    return this.goalsEntriesService.update(+id, updateGoalsEntryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goalsEntriesService.remove(+id)
  }
}

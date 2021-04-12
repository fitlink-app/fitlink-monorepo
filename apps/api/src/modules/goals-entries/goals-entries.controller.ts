import { Controller, Post, Body, Request } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'

@Controller('goals')
export class GoalsEntriesController {
  constructor(private readonly goalsEntriesService: GoalsEntriesService) {}

  @Post()
  create(@Request() request, @Body() body: RecreateGoalsEntryDto) {
    return this.goalsEntriesService.create(request.user.id, body)
  }

}

import { Controller, Post, Body, Request, Get, Query } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import {
  ApiBaseResponses,
  PaginationBody
} from '../../decorators/swagger.decorator'
import { ApiResponse } from '@nestjs/swagger'
import { GoalsEntry } from './entities/goals-entry.entity'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { PaginationQuery } from '../../helpers/paginate'

@ApiBaseResponses()
@Controller()
export class GoalsEntriesController {
  constructor(private readonly goalsEntriesService: GoalsEntriesService) {}

  @Post('me/goals')
  @ApiResponse({ type: GoalsEntry, status: 201 })
  create(@User() user: AuthenticatedUser, @Body() body: RecreateGoalsEntryDto) {
    return this.goalsEntriesService.create(user.id, body)
  }

  @Get('me/goals')
  @ApiResponse({ type: GoalsEntry, status: 201 })
  get(@User() user: AuthenticatedUser) {
    return this.goalsEntriesService.getLatest(user.id)
  }

  @Get('me/goals/history')
  @PaginationBody()
  @ApiResponse({ type: GoalsEntry, isArray: true, status: 201 })
  getHistory(
    @User() user: AuthenticatedUser,
    @Query() options: PaginationQuery
  ) {
    return this.goalsEntriesService.findAll(user.id, {
      limit: parseInt(options.limit) || 10,
      page: parseInt(options.page) || 0
    })
  }
}

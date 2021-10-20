import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  Param,
  ForbiddenException
} from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import {
  ApiBaseResponses,
  PaginationBody
} from '../../decorators/swagger.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { GoalsEntry } from './entities/goals-entry.entity'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { PaginationQuery } from '../../helpers/paginate'
import { Pagination } from '../../decorators/pagination.decorator'
import { Public } from '../../decorators/public.decorator'
import { ConfigService } from '@nestjs/config'
import { GoalJobDto } from './dto/goal-job.dto'

@ApiBaseResponses()
@Controller()
export class GoalsEntriesController {
  constructor(
    private readonly goalsEntriesService: GoalsEntriesService,
    private readonly configService: ConfigService
  ) {}

  @Post('me/goals')
  @ApiTags('me')
  @ApiResponse({ type: GoalsEntry, status: 201 })
  create(@User() user: AuthenticatedUser, @Body() body: RecreateGoalsEntryDto) {
    return this.goalsEntriesService.createOrUpdate(user.id, body)
  }

  @Get('me/goals')
  @ApiTags('me')
  @ApiResponse({ type: GoalsEntry, status: 201 })
  get(@User() user: AuthenticatedUser) {
    return this.goalsEntriesService.getLatest(user.id)
  }

  @Get('me/goals/history')
  @ApiTags('me')
  @PaginationBody()
  @ApiResponse({ type: GoalsEntry, isArray: true, status: 201 })
  getHistory(
    @User() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.goalsEntriesService.findAll(user.id, pagination)
  }

  /**
   * TODO: Privacy controls
   * @param userId
   * @returns goals entry
   */
  @Get('users/:userId/goals')
  @ApiTags('goals')
  @ApiResponse({ type: GoalsEntry, status: 200 })
  async getUserGoals(@Param('userId') userId: string) {
    return this.goalsEntriesService.getLatest(userId)
  }

  /**
   * TODO: Privacy controls
   * @param userId
   * @returns goals entry
   */
  @Get('users/:userId/goals/history')
  @ApiTags('goals')
  @PaginationBody()
  @ApiResponse({ type: GoalsEntry, isArray: true, status: 200 })
  getUserGoalsHistory(
    @Param('userId') userId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.goalsEntriesService.findAll(userId, pagination)
  }

  /**
   * Webhook for AWS Lambda to send goal reminders
   */
  @Public()
  @Post('/goals/job')
  async processRankChange(@Body() { verify_token }: GoalJobDto) {
    if (verify_token !== this.configService.get('JOBS_VERIFY_TOKEN')) {
      throw new ForbiddenException()
    }

    const result = await this.goalsEntriesService.processPendingGoalReminders()
    return result
  }
}

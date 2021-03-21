import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseInterceptors,
  UseGuards
} from '@nestjs/common'
import { LeaderboardEntriesService } from './leaderboard-entries.service'
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto'
import { NotFoundInterceptor } from '../../interceptors/notfound.interceptor'
import { AuthGuard } from '../../guards/auth.guard'
import { Public } from '../../decorators/public.decorator'

@Public()
@Controller('leaderboard-entries')
@UseGuards(AuthGuard)
export class LeaderboardEntriesController {
  constructor(
    private readonly leaderboardEntriesService: LeaderboardEntriesService
  ) {}

  @Post()
  create(@Body() createLeaderboardEntryDto: CreateLeaderboardEntryDto) {
    return this.leaderboardEntriesService.create(createLeaderboardEntryDto)
  }

  @Get(':leaderboardId')
  findAll(@Param('leaderboardId') leaderboardId: string, @Request() request) {
    return this.leaderboardEntriesService.findAll(leaderboardId, {
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,
      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  @Get(':leaderboardId/:userId')
  @UseInterceptors(
    new NotFoundInterceptor('No leaderboard entry found for the given userId')
  )
  findOne(
    @Param('leaderboardId') leaderboardId: string,
    @Param('userId') userId: string
  ) {
    return this.leaderboardEntriesService.findOne(leaderboardId, userId)
  }

  @Put(':leaderboardId/:userId')
  update(
    @Param('leaderboardId') leaderboardId: string,
    @Param('userId') userId: string,
    @Body() updateLeaderboardEntryDto: CreateLeaderboardEntryDto
  ) {
    return this.leaderboardEntriesService.create({
      ...updateLeaderboardEntryDto,
      leaderboard_id: leaderboardId,
      user_id: userId
    })
  }

  @Delete(':leaderboardId/:userId')
  remove(
    @Param('leaderboardId') leaderboardId: string,
    @Param('userId') userId: string
  ) {
    return this.leaderboardEntriesService.remove(leaderboardId, userId)
  }
}

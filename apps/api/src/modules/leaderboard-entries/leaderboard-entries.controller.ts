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
  UseGuards,
  Query
} from '@nestjs/common'
import { LeaderboardEntriesService } from './leaderboard-entries.service'
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto'
import { NotFoundInterceptor } from '../../interceptors/notfound.interceptor'
import { AuthGuard } from '../../guards/auth.guard'
import { Public } from '../../decorators/public.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@Public()
@ApiBearerAuth()
@ApiTags('leaderboard-entries')
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
  async findAll(@Param('leaderboardId') leaderboardId: string, @Query() query) {
    const results = await this.leaderboardEntriesService.findAll(
      leaderboardId,
      {
        limit: query.limit || 10,
        page: query.page || 0
      }
    )

    if (query.user) {
      const rank = await this.leaderboardEntriesService.findRankAndFlanksInLeaderboard(
        query.user,
        leaderboardId
      )
      return { ...results, rank }
    }

    return results
  }

  @Get('rank/:userId')
  findRankInLeaderboards(@Param('userId') userId: string) {
    return this.leaderboardEntriesService.findRankInLeaderboards(userId)
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

import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { LeaderboardsService } from './leaderboards.service'
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto'
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto'
import { Public } from '../../decorators/public.decorator'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

@Public()
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return this.leaderboardsService.create(createLeaderboardDto)
  }

  @ApiExcludeEndpoint()
  @Get()
  findAll() {
    return this.leaderboardsService.findAll()
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardsService.findOne(+id)
  }

  @ApiExcludeEndpoint()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaderboardDto: UpdateLeaderboardDto
  ) {
    return this.leaderboardsService.update(+id, updateLeaderboardDto)
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaderboardsService.remove(+id)
  }
}

import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { LeaderboardsService } from './leaderboards.service'
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto'
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto'

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post()
  create(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return this.leaderboardsService.create(createLeaderboardDto)
  }

  @Get()
  findAll() {
    return this.leaderboardsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaderboardDto: UpdateLeaderboardDto
  ) {
    return this.leaderboardsService.update(+id, updateLeaderboardDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaderboardsService.remove(+id)
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request
} from '@nestjs/common'
import { LeaguesService } from './leagues.service'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Post()
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leaguesService.create(createLeagueDto)
  }

  @Get()
  findAll(@Request() request) {
    return this.leaguesService.findAll({
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,

      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leaguesService.update(id, updateLeagueDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaguesService.remove(id)
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { LeaguesService } from './leagues.service'

@Controller()
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Iam(Roles.SuperAdmin)
  @Post('/leagues')
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leaguesService.create(createLeagueDto)
  }

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/leagues')
  teamCreate(
    @Body() createLeagueDto: CreateLeagueDto,
    @Param('teamId') teamId: string
  ) {
    return this.leaguesService.create(createLeagueDto, teamId)
  }

  @Iam(Roles.SuperAdmin)
  @Get('/leagues')
  findAll() {
    return this.leaguesService.findAll()
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/leagues')
  teamFindAll(@Param('teamId') teamId: string) {
    return this.leaguesService.getAllLeaguesForTeam(teamId)
  }

  @Iam(Roles.SuperAdmin)
  @Get('/leagues/:id')
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id)
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/leagues/:id')
  teamFindOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.getTeamLeagueWithId(id, teamId)
  }

  @Iam(Roles.SuperAdmin)
  @Put('/leagues/:id')
  update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leaguesService.update(id, updateLeagueDto)
  }

  @Iam(Roles.TeamAdmin)
  @Put('/teams/:teamId/leagues/:id')
  teamUpdate(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() updateLeagueDto: UpdateLeagueDto
  ) {
    return this.leaguesService.update(id, updateLeagueDto, teamId)
  }

  @Iam(Roles.SuperAdmin)
  @Delete('/leagues/:id')
  remove(@Param('id') id: string) {
    return this.leaguesService.remove(id)
  }

  @Iam(Roles.TeamAdmin)
  @Delete('/teams/:teamId/leagues/:id')
  teamDelete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.remove(id, teamId)
  }
}

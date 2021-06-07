import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { Iam } from '../../decorators/iam.decorator'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { League } from './entities/league.entity'
import { LeaguesService } from './leagues.service'

@ApiBaseResponses()
@Controller()
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  /**
   * Superadmins typically create public leagues
   * @param createLeagueDto
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Post('/leagues')
  @ApiResponse({ type: League, status: 201 })
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leaguesService.create(createLeagueDto)
  }

  /**
   * Team admins create leagues for their team
   * @param createLeagueDto
   * @param teamId
   * @returns
   */

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/leagues')
  @ApiResponse({ type: League, status: 201 })
  teamCreate(
    @Body() createLeagueDto: CreateLeagueDto,
    @Param('teamId') teamId: string
  ) {
    return this.leaguesService.create(createLeagueDto, teamId)
  }

  /**
   * Superadmin can retrieve all leagues
   * This should typically be public leagues
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get('/leagues')
  @ApiResponse({ type: League, isArray: true, status: 200 })
  findAll() {
    return this.leaguesService.findAll()
  }

  /**
   * Team admin can retrieve all leagues within the team
   * @param teamId
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/leagues')
  @ApiResponse({ type: League, isArray: true, status: 200 })
  teamFindAll(@Param('teamId') teamId: string) {
    return this.leaguesService.getAllLeaguesForTeam(teamId)
  }

  /**
   * Superadmin can get a single league
   * Typically this is a public league
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get('/leagues/:id')
  @ApiResponse({ type: League, status: 200 })
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id)
  }

  /**
   * Team admin can get a single league within the team
   * @param teamId
   * @param id
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/leagues/:id')
  @ApiResponse({ type: League, status: 200 })
  teamFindOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.getTeamLeagueWithId(id, teamId)
  }

  /**
   * Superadmin can update a league
   * Typically this is a public league
   * @param id
   * @param updateLeagueDto
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Put('/leagues/:id')
  @ApiBody({ type: UpdateLeagueDto })
  @ApiResponse({ type: League, status: 200 })
  update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leaguesService.update(id, updateLeagueDto)
  }

  /**
   * Team admin can update a league within the team
   * @param teamId
   * @param id
   * @param updateLeagueDto
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Put('/teams/:teamId/leagues/:id')
  @ApiResponse({ type: League, status: 200 })
  teamUpdate(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() updateLeagueDto: UpdateLeagueDto
  ) {
    return this.leaguesService.update(id, updateLeagueDto, teamId)
  }

  /**
   * Superadmin can delete a league.
   * Typically this is a public league.
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Delete('/leagues/:id')
  @DeleteResponse()
  remove(@Param('id') id: string) {
    return this.leaguesService.remove(id)
  }

  /**
   * Team admin can delete a league within the team
   * @param teamId
   * @param id
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Delete('/teams/:teamId/leagues/:id')
  @DeleteResponse()
  teamDelete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.remove(id, teamId)
  }
}

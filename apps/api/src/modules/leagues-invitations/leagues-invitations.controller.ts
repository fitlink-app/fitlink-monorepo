import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { LeaguesInvitationsService } from './leagues-invitations.service'
import { CreateLeaguesInvitationDto } from './dto/create-leagues-invitation.dto'
import { UpdateLeaguesInvitationDto } from './dto/update-leagues-invitation.dto'

@Controller('leagues-invitations')
export class LeaguesInvitationsController {
  constructor(
    private readonly leagueInvitationsService: LeaguesInvitationsService
  ) {}

  @Post()
  create(@Body() createLeaguesInvitationDto: CreateLeaguesInvitationDto) {
    return this.leagueInvitationsService.create(createLeaguesInvitationDto)
  }

  @Get()
  findAll() {
    return this.leagueInvitationsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leagueInvitationsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaguesInvitationDto: UpdateLeaguesInvitationDto
  ) {
    return this.leagueInvitationsService.update(+id, updateLeaguesInvitationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leagueInvitationsService.remove(+id)
  }
}

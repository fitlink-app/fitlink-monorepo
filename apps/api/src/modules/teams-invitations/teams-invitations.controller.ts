import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { TeamsInvitationsService } from './teams-invitations.service'
import { CreateTeamsInvitationDto } from './dto/create-teams-invitation.dto'
import { UpdateTeamsInvitationDto } from './dto/update-teams-invitation.dto'

@Controller('teams-invitations')
export class TeamsInvitationsController {
  constructor(
    private readonly teamsInvitationsService: TeamsInvitationsService
  ) {}

  @Post()
  create(@Body() createTeamsInvitationDto: CreateTeamsInvitationDto) {
    return this.teamsInvitationsService.create(createTeamsInvitationDto)
  }

  @Get()
  findAll() {
    return this.teamsInvitationsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsInvitationsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeamsInvitationDto: UpdateTeamsInvitationDto
  ) {
    return this.teamsInvitationsService.update(+id, updateTeamsInvitationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsInvitationsService.remove(+id)
  }
}

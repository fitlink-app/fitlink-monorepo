import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { OrganisationsInvitationsService } from './organisations-invitations.service'
import { CreateOrganisationsInvitationDto } from './dto/create-organisations-invitation.dto'
import { UpdateOrganisationsInvitationDto } from './dto/update-organisations-invitation.dto'

@Controller('organisations-invitations')
export class OrganisationsInvitationsController {
  constructor(
    private readonly organisationsInvitationsService: OrganisationsInvitationsService
  ) {}

  @Post()
  create(
    @Body() createOrganisationsInvitationDto: CreateOrganisationsInvitationDto
  ) {
    return this.organisationsInvitationsService.create(
      createOrganisationsInvitationDto
    )
  }

  /*
  @Get()
  findAll() {
    return this.organisationsInvitationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organisationsInvitationsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrganisationsInvitationDto: UpdateOrganisationsInvitationDto) {
    return this.organisationsInvitationsService.update(+id, updateOrganisationsInvitationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationsInvitationsService.remove(+id);
  }
  */
}

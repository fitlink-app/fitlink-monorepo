import { Injectable } from '@nestjs/common'
import { CreateTeamsInvitationDto } from './dto/create-teams-invitation.dto'
import { UpdateTeamsInvitationDto } from './dto/update-teams-invitation.dto'

@Injectable()
export class TeamsInvitationsService {
  create(createTeamsInvitationDto: CreateTeamsInvitationDto) {
    return 'This action adds a new teamsInvitation'
  }

  findAll() {
    return `This action returns all teamsInvitations`
  }

  findOne(id: number) {
    return `This action returns a #${id} teamsInvitation`
  }

  update(id: number, updateTeamsInvitationDto: UpdateTeamsInvitationDto) {
    return `This action updates a #${id} teamsInvitation`
  }

  remove(id: number) {
    return `This action removes a #${id} teamsInvitation`
  }
}

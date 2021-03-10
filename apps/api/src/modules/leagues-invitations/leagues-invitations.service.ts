import { Injectable } from '@nestjs/common'
import { CreateLeaguesInvitationDto } from './dto/create-leagues-invitation.dto'
import { UpdateLeaguesInvitationDto } from './dto/update-leagues-invitation.dto'

@Injectable()
export class LeaguesInvitationsService {
  create(createLeaguesInvitationDto: CreateLeaguesInvitationDto) {
    return 'This action adds a new leagueInvitation'
  }

  findAll() {
    return `This action returns all leagueInvitations`
  }

  findOne(id: number) {
    return `This action returns a #${id} leagueInvitation`
  }

  update(id: number, updateLeaguesInvitationDto: UpdateLeaguesInvitationDto) {
    return `This action updates a #${id} leagueInvitation`
  }

  remove(id: number) {
    return `This action removes a #${id} leagueInvitation`
  }
}

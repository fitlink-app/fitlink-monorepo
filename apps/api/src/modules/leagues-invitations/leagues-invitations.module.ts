import { Module } from '@nestjs/common'
import { LeaguesInvitationsService } from './leagues-invitations.service'
import { LeaguesInvitationsController } from './leagues-invitations.controller'

@Module({
  controllers: [LeaguesInvitationsController],
  providers: [LeaguesInvitationsService]
})
export class LeaguesInvitationsModule {}

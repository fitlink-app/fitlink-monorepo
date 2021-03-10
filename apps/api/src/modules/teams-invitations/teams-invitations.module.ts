import { Module } from '@nestjs/common'
import { TeamsInvitationsService } from './teams-invitations.service'
import { TeamsInvitationsController } from './teams-invitations.controller'

@Module({
  controllers: [TeamsInvitationsController],
  providers: [TeamsInvitationsService]
})
export class TeamsInvitationsModule {}

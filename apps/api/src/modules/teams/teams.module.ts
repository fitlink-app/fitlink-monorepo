import { HttpModule, Module } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { TeamsController } from './teams.controller'
import { TeamsInvitationsModule } from '../teams-invitations/teams-invitations.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Team } from './entities/team.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { ImagesModule } from '../images/images.module'
import { Organisation } from '../organisations/entities/organisation.entity'
import { User } from '../users/entities/user.entity'
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, Organisation, User, TeamsInvitation]),
    AuthModule,
    ConfigModule,
    HttpModule,
    ImagesModule,
    TeamsInvitationsModule
  ],
  controllers: [TeamsController],
  providers: [TeamsService]
})
export class TeamsModule {}

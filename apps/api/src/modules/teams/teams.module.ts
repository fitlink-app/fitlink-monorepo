import { HttpModule, Module } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { TeamsController } from './teams.controller'
import { TeamsInvitationsModule } from '../teams-invitations/teams-invitations.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Team } from './entities/team.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { ImagesModule } from '../images/images.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
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

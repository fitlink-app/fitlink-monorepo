import { Module } from '@nestjs/common'
import { TeamsInvitationsService } from './teams-invitations.service'
import { TeamsInvitationsController } from './teams-invitations.controller'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamsInvitation } from './entities/teams-invitation.entity'
import { JwtModule } from '@nestjs/jwt'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([TeamsInvitation]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('EMAIL_JWT_TOKEN_SECRET'),
          signOptions: { expiresIn: '7d' }
        }
      }
    })
  ],
  controllers: [TeamsInvitationsController],
  providers: [TeamsInvitationsService, ConfigService],
  exports: [
    TypeOrmModule.forFeature([TeamsInvitation]),
    TeamsInvitationsService
  ]
})
export class TeamsInvitationsModule {}

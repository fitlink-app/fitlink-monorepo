import { Module } from '@nestjs/common'
import { TeamsInvitationsService } from './teams-invitations.service'
import { TeamsInvitationsController } from './teams-invitations.controller'
import { EmailService } from '../common/email.service'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamsInvitation } from './entities/teams-invitation.entity'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
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
  providers: [TeamsInvitationsService, EmailService, ConfigService],
  exports: [
    TypeOrmModule.forFeature([TeamsInvitation]),
    TeamsInvitationsService
  ]
})
export class TeamsInvitationsModule {}

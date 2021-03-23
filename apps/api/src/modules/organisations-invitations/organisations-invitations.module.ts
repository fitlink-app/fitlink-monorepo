import { Module } from '@nestjs/common'
import { OrganisationsInvitationsService } from './organisations-invitations.service'
import { OrganisationsInvitationsController } from './organisations-invitations.controller'
import { EmailService } from '../common/email.service'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsInvitation } from './entities/organisations-invitation.entity'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganisationsInvitation]),
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
  controllers: [OrganisationsInvitationsController],
  providers: [OrganisationsInvitationsService, EmailService, ConfigService],
  exports: [
    TypeOrmModule.forFeature([OrganisationsInvitation]),
    OrganisationsInvitationsService
  ]
})
export class OrganisationsInvitationsModule {}

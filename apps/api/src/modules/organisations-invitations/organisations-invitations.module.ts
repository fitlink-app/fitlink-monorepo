import { Module } from '@nestjs/common'
import { OrganisationsInvitationsService } from './organisations-invitations.service'
import { OrganisationsInvitationsController } from './organisations-invitations.controller'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsInvitation } from './entities/organisations-invitation.entity'
import { JwtModule } from '@nestjs/jwt'
import { CommonModule } from '../common/common.module'
import { Organisation } from '../organisations/entities/organisation.entity'

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([OrganisationsInvitation, Organisation]),
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
  providers: [OrganisationsInvitationsService, ConfigService],
  exports: [
    TypeOrmModule.forFeature([OrganisationsInvitation]),
    OrganisationsInvitationsService
  ]
})
export class OrganisationsInvitationsModule {}

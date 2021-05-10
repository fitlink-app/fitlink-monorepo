import { Module } from '@nestjs/common'
import { UsersInvitationsService } from './users-invitations.service'
import { UsersInvitationsController } from './users-invitations.controller'
import { EmailService } from '../common/email.service'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../../modules/users/entities/user.entity'
import { UserRolesModule } from '../user-roles/user-roles.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('EMAIL_JWT_TOKEN_SECRET'),
          signOptions: { expiresIn: '365d' }
        }
      }
    }),
    UserRolesModule
  ],
  controllers: [UsersInvitationsController],
  providers: [
    UsersInvitationsService,
    UsersService,
    EmailService,
    ConfigService
  ],
  exports: [UsersInvitationsService]
})
export class UsersInvitationsModule {}

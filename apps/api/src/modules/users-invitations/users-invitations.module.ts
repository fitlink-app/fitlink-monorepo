import { Module } from '@nestjs/common'
import { UsersInvitationsService } from './users-invitations.service'
import { UsersInvitationsController } from './users-invitations.controller'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../../modules/users/entities/user.entity'
import { UserRolesModule } from '../user-roles/user-roles.module'
import { CommonModule } from '../common/common.module'
import { AuthProvider } from '../auth/entities/auth-provider.entity'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    CommonModule,
    NotificationsModule,
    TypeOrmModule.forFeature([User, AuthProvider]),
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
  providers: [UsersInvitationsService, UsersService, ConfigService],
  exports: [UsersInvitationsService]
})
export class UsersInvitationsModule {}

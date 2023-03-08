import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategy/local.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { RefreshToken } from './entities/auth.entity'
import { UserRolesModule } from '../user-roles/user-roles.module'
import { CommonModule } from '../common/common.module'
import { AuthProvider } from './entities/auth-provider.entity'
import { Team } from '../teams/entities/team.entity'
import { OrganisationsModule } from '../organisations/organisations.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersSettingsModule } from '../users-settings/users-settings.module'
import { GoalsEntriesModule } from '../goals-entries/goals-entries.module'
import { ClientIdContextModule } from '../client-id/client-id.module'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([RefreshToken, AuthProvider, Team]),
    ConfigModule,
    UsersModule,
    PassportModule,
    CommonModule,
    NotificationsModule,
    forwardRef(() => UsersSettingsModule),
    forwardRef(() => OrganisationsModule),
    forwardRef(() => UserRolesModule),
    forwardRef(() => GoalsEntriesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('AUTH_JWT_SECRET'),
          signOptions: { expiresIn: '1h' }
        }
      }
    }),
    ClientIdContextModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
  exports: [
    TypeOrmModule.forFeature([RefreshToken, AuthProvider]),
    AuthService,
    UsersService
  ]
})
export class AuthModule {}

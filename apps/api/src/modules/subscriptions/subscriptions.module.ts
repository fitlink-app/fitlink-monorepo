import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { SubscriptionsController } from './subscriptions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subscription } from './entities/subscription.entity'
import { SubscriptionsInvitation } from './entities/subscriptions-invitation.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { OrganisationsModule } from '../organisations/organisations.module'
import { TeamsModule } from '../teams/teams.module'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { SubscriptionsInvitationsController } from './subscriptions-invitations.controller'
import { SubscriptionsInvitationsService } from './subscriptions-invitations.service'
import { CommonModule } from '../common/common.module'
import { JwtModule } from '@nestjs/jwt'
import { UserRolesModule } from '../user-roles/user-roles.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionsInvitation,
      Organisation,
      Team,
      User
    ]),
    forwardRef(() => OrganisationsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => TeamsModule),
    ConfigModule,
    HttpModule,
    CommonModule,
    UserRolesModule,
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
  controllers: [SubscriptionsController, SubscriptionsInvitationsController],
  providers: [SubscriptionsService, SubscriptionsInvitationsService],
  exports: [SubscriptionsService, TypeOrmModule.forFeature([Subscription])]
})
export class SubscriptionsModule {}

import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { SubscriptionsController } from './subscriptions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subscription } from './entities/subscription.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { OrganisationsModule } from '../organisations/organisations.module'
import { TeamsModule } from '../teams/teams.module'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Organisation, Team, User]),
    forwardRef(() => OrganisationsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => TeamsModule),
    ConfigModule,
    HttpModule
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService, TypeOrmModule.forFeature([Subscription])]
})
export class SubscriptionsModule {}

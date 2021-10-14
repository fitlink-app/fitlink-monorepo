import { HttpModule, Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsService } from './organisations.service'
import { OrganisationsController } from './organisations.controller'
import { Organisation } from './entities/organisation.entity'
import { ImagesModule } from '../images/images.module'
import { AuthModule } from '../auth/auth.module'
import { OrganisationsInvitationsModule } from '../organisations-invitations/organisations-invitations.module'
import { User } from '../users/entities/user.entity'
import { CommonModule } from '../common/common.module'
import { UserRolesModule } from '../user-roles/user-roles.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { TeamsModule } from '../teams/teams.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisation, User]),
    forwardRef(() => AuthModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => TeamsModule),
    // SubscriptionsModule,
    ConfigModule,
    HttpModule,
    ImagesModule,
    OrganisationsInvitationsModule,
    CommonModule,
    UserRolesModule
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [TypeOrmModule.forFeature([Organisation]), OrganisationsService]
})
export class OrganisationsModule {}

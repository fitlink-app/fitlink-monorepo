import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsService } from './organisations.service'
import { OrganisationsController } from './organisations.controller'
import { Organisation } from './entities/organisation.entity'
import { ImagesModule } from '../images/images.module'
import { AuthModule } from '../auth/auth.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { OrganisationsInvitationsModule } from '../organisations-invitations/organisations-invitations.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    AuthModule,
    ConfigModule,
    HttpModule,
    ImagesModule,
    OrganisationsInvitationsModule,
    SubscriptionsModule
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [TypeOrmModule.forFeature([Organisation]), OrganisationsService]
})
export class OrganisationsModule {}

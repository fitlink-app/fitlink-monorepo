import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsService } from './organisations.service'
import { OrganisationsController } from './organisations.controller'
import { Organisation } from './entities/organisation.entity'
import { ImagesModule } from '../images/images.module'
import { AuthModule } from '../auth/auth.module'
import { OrganisationsInvitationsModule } from '../organisations-invitations/organisations-invitations.module'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisation, User]),
    AuthModule,
    ConfigModule,
    HttpModule,
    ImagesModule,
    OrganisationsInvitationsModule
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [TypeOrmModule.forFeature([Organisation]), OrganisationsService]
})
export class OrganisationsModule {}

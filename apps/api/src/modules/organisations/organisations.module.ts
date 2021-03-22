import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganisationsService } from './organisations.service'
import { OrganisationsController } from './organisations.controller'
import { Organisation } from './entities/organisation.entity'
import { ImagesModule } from '../images/images.module'
import { AuthModule } from '../auth/auth.module'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    AuthModule,
    ConfigModule,
    HttpModule,
    ImagesModule
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService, SubscriptionsService]
})
export class OrganisationsModule {}

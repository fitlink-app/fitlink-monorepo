import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from './entities/user.entity'
import { ConfigModule } from '@nestjs/config'
import { UsersInvitationsModule } from '../users-invitations/users-invitations.module'
import { UserRolesService } from '../user-roles/user-roles.service'
import { UserRole } from '../user-roles/entities/user-role.entity'
import { UserRolesModule } from '../user-roles/user-roles.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    HttpModule,
    UserRolesModule,
    UsersInvitationsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule.forFeature([User]), UsersService]
})
export class UsersModule {}

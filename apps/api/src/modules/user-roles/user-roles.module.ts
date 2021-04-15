import { Module } from '@nestjs/common'
import { UserRolesService } from './user-roles.service'
import { UserRolesController } from './user-roles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRole } from './entities/user-role.entity'
import { AuthModule } from '../auth/auth.module'
import { Organisation } from '../organisations/entities/organisation.entity'
import { User } from '../users/entities/user.entity'
import { Team } from '../teams/entities/team.entity'

@Module({
  imports: [TypeOrmModule.forFeature([UserRole]), AuthModule],
  controllers: [UserRolesController],
  providers: [UserRolesService]
})
export class UserRolesModule {}

import { forwardRef, Module } from '@nestjs/common'
import { UserRolesService } from './user-roles.service'
import { UserRolesController } from './user-roles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRole } from './entities/user-role.entity'
import { AuthModule } from '../auth/auth.module'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, User]),
    forwardRef(() => AuthModule)
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [TypeOrmModule.forFeature([UserRole, User]), UserRolesService]
})
export class UserRolesModule {}

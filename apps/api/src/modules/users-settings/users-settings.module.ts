import { Module } from '@nestjs/common'
import { UserSettingsService } from './users-settings.service'
import { UserSettingsController } from './users-settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { UsersSetting } from './entities/users-setting.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, UsersSetting]), AuthModule],
  controllers: [UserSettingsController],
  providers: [UserSettingsService]
})
export class UsersSettingsModule {}

import { forwardRef, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { UserSettingsService } from './users-settings.service'
import { UserSettingsController } from './users-settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { UsersSetting } from './entities/users-setting.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UsersSetting]),
    forwardRef(() => AuthModule),
    HttpModule,
    ConfigModule
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService]
})
export class UsersSettingsModule {}

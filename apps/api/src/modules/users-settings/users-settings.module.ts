import { Module } from '@nestjs/common'
import { UserSettingsService } from './users-settings.service'
import { UserSettingsController } from './users-settings.controller'

@Module({
  controllers: [UserSettingsController],
  providers: [UserSettingsService]
})
export class UsersSettingsModule {}

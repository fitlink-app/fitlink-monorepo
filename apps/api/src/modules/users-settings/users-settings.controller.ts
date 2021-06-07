import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { UserSettingsService } from './users-settings.service'
import { CreateUsersSettingDto } from './dto/create-users-setting.dto'
import { UpdateUsersSettingDto } from './dto/update-users-setting.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'

@Controller()
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Put('me/settings')
  updateMySettings(
    @Body() updateUserSettingsDto: UpdateUsersSettingDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.userSettingsService.update(user.id, updateUserSettingsDto)
  }

  @Iam(Roles.Self)
  @Post('users-settings/:userId')
  create(
    @Body() createUsersSettingDto: CreateUsersSettingDto,
    @Param('userId') userId: string
  ) {
    return this.userSettingsService.create(createUsersSettingDto, userId)
  }

  @Iam(Roles.Self)
  @Get('users-settings/:userId')
  findOne(@Param('userId') userId: string) {
    return this.userSettingsService.findOne(userId)
  }

  @Iam(Roles.Self)
  @Put('users-settings/:userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUsersSettingDto: UpdateUsersSettingDto
  ) {
    return this.userSettingsService.update(userId, updateUsersSettingDto)
  }

  @Iam(Roles.Self)
  @Delete('users-settings/:userId')
  remove(@Param('userId') userId: string) {
    return this.userSettingsService.remove(userId)
  }
}

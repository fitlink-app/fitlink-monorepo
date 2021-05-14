import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { UserSettingsService } from './users-settings.service'
import { CreateUsersSettingDto } from './dto/create-users-setting.dto'
import { UpdateUsersSettingDto } from './dto/update-users-setting.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('users-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Iam(Roles.Self)
  @Post(':userId')
  create(
    @Body() createUsersSettingDto: CreateUsersSettingDto,
    @Param('userId') userId: string
  ) {
    return this.userSettingsService.create(createUsersSettingDto, userId)
  }

  @Iam(Roles.Self)
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userSettingsService.findOne(userId)
  }

  @Iam(Roles.Self)
  @Put(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUsersSettingDto: UpdateUsersSettingDto
  ) {
    return this.userSettingsService.update(userId, updateUsersSettingDto)
  }

  @Iam(Roles.Self)
  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userSettingsService.remove(userId)
  }
}

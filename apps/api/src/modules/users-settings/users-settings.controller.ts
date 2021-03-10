import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { UserSettingsService } from './users-settings.service'
import { CreateUsersSettingDto } from './dto/create-users-setting.dto'
import { UpdateUsersSettingDto } from './dto/update-users-setting.dto'

@Controller('users-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Post()
  create(@Body() createUsersSettingDto: CreateUsersSettingDto) {
    return this.userSettingsService.create(createUsersSettingDto)
  }

  @Get()
  findAll() {
    return this.userSettingsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSettingsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsersSettingDto: UpdateUsersSettingDto
  ) {
    return this.userSettingsService.update(+id, updateUsersSettingDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSettingsService.remove(+id)
  }
}

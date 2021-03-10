import { Injectable } from '@nestjs/common'
import { CreateUsersSettingDto } from './dto/create-users-setting.dto'
import { UpdateUsersSettingDto } from './dto/update-users-setting.dto'

@Injectable()
export class UserSettingsService {
  create(createUsersSettingDto: CreateUsersSettingDto) {
    return 'This action adds a new userSetting'
  }

  findAll() {
    return `This action returns all userSettings`
  }

  findOne(id: number) {
    return `This action returns a #${id} userSetting`
  }

  update(id: number, updateUsersSettingDto: UpdateUsersSettingDto) {
    return `This action updates a #${id} userSetting`
  }

  remove(id: number) {
    return `This action removes a #${id} userSetting`
  }
}

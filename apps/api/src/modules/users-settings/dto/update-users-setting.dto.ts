import { PartialType } from '@nestjs/mapped-types'
import { CreateUsersSettingDto } from './create-users-setting.dto'

export class UpdateUsersSettingDto extends PartialType(CreateUsersSettingDto) {}

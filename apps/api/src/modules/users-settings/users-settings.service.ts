import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { CreateUsersSettingDto } from './dto/create-users-setting.dto'
import { UpdateUsersSettingDto } from './dto/update-users-setting.dto'
import { UsersSetting } from './entities/users-setting.entity'

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UsersSetting)
    private userSettingsRepository: Repository<UsersSetting>
  ) {}
  async create(createUsersSettingDto: CreateUsersSettingDto, userId: string) {
    const userSettings = await this.userSettingsRepository.save(
      this.userSettingsRepository.create({
        ...createUsersSettingDto,
        user: { id: userId }
      })
    )
    return userSettings
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['settings']
    })
    return user.settings
  }

  async update(id: string, updateUsersSettingDto: UpdateUsersSettingDto) {
    const user = await this.userRepository.findOne(id, {
      relations: ['settings']
    })

    const newUserSettings = await this.userSettingsRepository.save({
      user,
      ...user.settings,
      ...updateUsersSettingDto
    })

    delete newUserSettings.user
    return newUserSettings
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['settings']
    })
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'settings')
      .of(id)
      .set(null)
    const deleteResults = await this.userSettingsRepository.delete(
      user.settings.id
    )
    return {
      deleteResults,
      user
    }
  }
}

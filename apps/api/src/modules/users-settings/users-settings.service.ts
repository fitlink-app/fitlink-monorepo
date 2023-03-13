import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
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
    private userSettingsRepository: Repository<UsersSetting>,
    private httpService: HttpService,
    private configService: ConfigService
  ) {}
  async create(createUsersSettingDto: CreateUsersSettingDto, userId: string) {
    const userSettings = await this.userSettingsRepository.save(
      this.userSettingsRepository.create({
        ...createUsersSettingDto,
        user: { id: userId }
      })
    )

    const user = await this.userRepository.findOne(userId)

    try {
      await this.updateIntercomSettings(user, userSettings)
    } catch (e) {
      console.error(e)
    }

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

    try {
      await this.updateIntercomSettings(user, newUserSettings)
    } catch (e) {
      console.error(e)
    }

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

  async updateIntercomSettings(user: User, settings: UsersSetting) {
    const adminEmail = settings.newsletter_subscriptions_admin
    const userEmail = settings.newsletter_subscriptions_user
    const token = this.configService.get('INTERCOM_API_KEY')

    try {
      await this.httpService
        .post(
          'https://api.intercom.io/contacts',
          {
            custom_attributes: {
              'Admin Newsletter': adminEmail,
              'User Newsletter': userEmail
            },
            name: user.name,
            email: user.email
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-type': 'application/json'
            }
          }
        )
        .toPromise()
    } catch (e) {
      const result = e.response
      if (result.data.errors && result.data.errors[0].code === 'conflict') {
        const existId = result.data.errors[0].message.split('=')[1]

        await this.httpService
          .put(
            `https://api.intercom.io/contacts/${existId}`,
            {
              custom_attributes: {
                'Admin Newsletter': adminEmail,
                'User Newsletter': userEmail
              }
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-type': 'application/json'
              }
            }
          )
          .toPromise()
        return result
      }
    }
  }
}

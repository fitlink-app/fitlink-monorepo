import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { User } from '../users/entities/user.entity'
import { CreateManualProviderDto } from './dto/create-manual-provider.dto'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { Provider } from './entities/provider.entity'
import { ProviderType } from './providers.constants'

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createProviderDto: CreateProviderDto, userId: string) {
    const {
      type,
      token,
      refresh_token,
      token_expires_at,
      scopes,
      provider_user_id
    } = createProviderDto

    try {
      const tokenExpiresAt = new Date(token_expires_at)
      const user = await this.userRepository.findOne(userId, {
        relations: ['providers']
      })
      const exists = user.providers.filter((e) => e.type === type)[0]
      let id: string

      if (exists) {
        id = exists.id
      }

      // Replaces the existing data in case it needs an update
      const provider = this.providerRepository.create({
        id,
        user: { id: userId },
        token_expires_at: tokenExpiresAt,
        type,
        token,
        refresh_token,
        scopes,
        provider_user_id,

        // Reset the token to not have an error
        token_error: false
      })

      return await this.providerRepository.save(provider)
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  /**
   * For manually creating a provider
   *
   *
   * @param param0
   * @param userId
   * @returns
   */
  async createManual({ type }: CreateManualProviderDto, userId: string) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['providers']
    })

    const exists = user.providers.filter((e) => e.type === type)[0]

    let id: string
    if (exists) {
      id = exists.id
    }

    return this.providerRepository.save(
      this.providerRepository.create({
        id,
        user: { id: userId },
        type,
        token_error: false
      })
    )
  }

  async findAll(id: string) {
    return await this.providerRepository.find({
      where: { user: { id } }
    })
  }

  async findOne(userId: string, providerType: ProviderType) {
    try {
      return await this.providerRepository.findOne({
        where: {
          user: { id: userId },
          type: providerType
        }
      })
    } catch (e) {
      throw new BadRequestException(e.message, `Not Found`)
    }
  }

  async update(
    userId: string,
    providerType: ProviderType,
    updateProviderDto: UpdateProviderDto
  ) {
    const provider = await this.findOne(userId, providerType)
    return await this.providerRepository.save({
      ...provider,
      ...updateProviderDto,
      token_error: false
    })
  }

  async setProviderTokenError(userId: string, providerType: ProviderType) {
    const provider = await this.findOne(userId, providerType)
    return await this.providerRepository.save({
      ...provider,
      token_error: true
    })
  }

  /**
   * Detaches existing health activities from provider
   * Removes provider
   *
   * @param userId
   * @param providerType
   * @returns
   */
  async remove(userId: string, providerType: ProviderType) {
    return this.providerRepository.manager.transaction(async (manager) => {
      await manager.getRepository(HealthActivity).update(
        {
          user: { id: userId },
          provider: { type: providerType }
        },
        {
          provider: null
        }
      )

      return manager.getRepository(Provider).delete({
        type: providerType,
        user: { id: userId }
      })
    })
  }

  async getUserByOwnerId(owner_id: string) {
    return await this.providerRepository.findOne({
      where: { provider_user_id: owner_id },
      relations: ['user']
    })
  }
}

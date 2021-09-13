import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
        provider_user_id
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

    return this.providerRepository.create({
      id,
      user: { id: userId }
    })
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
      ...updateProviderDto
    })
  }

  async remove(userId: string, providerType: ProviderType) {
    return await this.providerRepository.delete({
      type: providerType,
      user: { id: userId }
    })
  }

  async getUserByOwnerId(owner_id: string) {
    return await this.providerRepository.findOne({
      where: { provider_user_id: owner_id },
      relations: ['user']
    })
  }
}

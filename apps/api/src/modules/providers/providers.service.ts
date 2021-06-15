import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { Provider, ProviderType } from './entities/provider.entity'

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

    const tokenExpiresAt = new Date(token_expires_at)
    try {
      const provider = this.providerRepository.create({
        user: { id: userId },
        token_expires_at: tokenExpiresAt,
        type,
        token,
        refresh_token,
        scopes,
        provider_user_id
      })

      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'providers')
        .of(userId)
        .add(provider)

      return await this.providerRepository.save(provider)
    } catch (err) {
      throw new BadRequestException(err.message)
    }
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

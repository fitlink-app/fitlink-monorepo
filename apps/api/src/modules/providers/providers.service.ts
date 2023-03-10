import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { User } from '../users/entities/user.entity'
import { CreateManualProviderDto } from './dto/create-manual-provider.dto'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { Provider } from './entities/provider.entity'
import { ProviderType } from './providers.constants'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { WebhookRefreshTokenResponseDto } from './dto/refresh-token.dto'
import { RenewWebhookResponseDto } from './dto/renew-webhook.dto'

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService
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
  async createManual({ type, deviceId }: CreateManualProviderDto, userId: string) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['providers']
    })

    const exists = user.providers.filter((e) => e.type === type)[0]

    let id: string
    if (exists) {
      id = exists.id
    }

    const provider = await this.providerRepository.save(
      this.providerRepository.create({
        id,
        user: { id: userId },
        type,
        token_error: false
      })
    );

    // we need to generate a token based of the device ID
    // this token will then be used to sync data from the device
    const { refresh_token, token  } = await this.generateRefreshTokenAndToken(provider, deviceId);

    return { ...provider, refresh_token, token}

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

  async findOneByProviderId(providerId: string) {
    try {
      return await this.providerRepository.findOne({
        where: {
          id: providerId
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

  async refreshSessionToken(refreshToken: string) {
    // TODO(API): verify the token better

    const decoded = this.jwtService.decode(refreshToken) as { sub: string, _rft: boolean };
    if (!decoded._rft || !decoded.sub) {
      throw new HttpException(
        'Not a valid refresh token',
        HttpStatus.UNAUTHORIZED
      )
    }
    const providerId = decoded.sub;
    const providers = await this.providerRepository.find({
      where: {
        refresh_token: refreshToken,
        id: providerId
      }
    })
    if (!providers.length) {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED)
    }

    // Generate a new token
    return this.generateToken(providers[0]).then((token) => {
      return {
        token
      } as WebhookRefreshTokenResponseDto
    });
  }


  async renewWebhook(providerId: string, deviceId: string) {
    const provider = await this.providerRepository.findOne(providerId);
    if (!provider) {
      throw new HttpException('Provider not found', HttpStatus.NOT_FOUND)
    }

    const { refresh_token, token } = await this.generateRefreshTokenAndToken(provider, deviceId);

    return {
      refresh_token,
      token
    } as RenewWebhookResponseDto
  }


  /**
   * Create a token and refresh token for the device that using the authentication
   * @param Provider
   * @param deviceId
   * @returns refreshToken
   */
  private async generateRefreshTokenAndToken(provider: Provider, deviceId: string) {
    const promises = [
      this.generateToken(provider, false),
      this.generateRefreshToken(provider, deviceId, false)
    ]
    return Promise.all(promises).then((values) => {
      const token = values[0],
        refreshToken = values[1];
      return this.providerRepository.update(provider.id, {
        token: token,
        refresh_token: refreshToken
      }).then(() => {
        return {
          token,
          refresh_token: refreshToken
        }
      });
    });
  }

  /**
   * Create a token for the device that using the authentication
   * @param Provider
   * @param deviceId
   * @returns token
   */
  private async generateToken(provider: Provider, withSave = true) {
    const refreshTokenPayload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: provider.id,
    }

    const token = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '365d',
      secret: provider.id + this.configService.get('WEBHOOK_PROVIDER_JWT_TOKEN_SECRET')
    })

    if (withSave) {
      this.providerRepository.update(provider.id, {
        token: token
      });
    }
    return token
  }

  /**
   * Create a refresh token for the device that using the authentication
   * @param Provider
   * @param deviceId
   * @returns token
   */
  private async generateRefreshToken(provider: Provider, deviceId: string, withSave = true) {
    const refreshTokenPayload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: provider.id,
      _rft: true // Refresh token
    }

    const token = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '3650d',
      secret: deviceId + this.configService.get('WEBHOOK_PROVIDER_JWT_TOKEN_SECRET')
    })

    if (withSave) {
      this.providerRepository.update(provider.id, {
        refresh_token: token
      });
    }
    return token
  }
}

import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { CreateManualProviderDto } from './dto/create-manual-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { ProviderType } from './providers.constants'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Link a provider manually
   * @param createProviderDto
   * @param user
   *
   * This is for Google Fit & Apple Healthkit. Other services
   * need to go through an Oauth flow via the API.
   *
   */
  @Post('/me/providers')
  link(
    @Body() createProviderDto: CreateManualProviderDto,
    @User() user: AuthenticatedUser
  ) {
    return this.providersService.create(createProviderDto, user.id)
  }

  /**
   * Get the authenticated user's providers
   *
   * @param user
   * @returns
   */
  @Get('/me/providers')
  findAll(@User() user: AuthenticatedUser) {
    return this.providersService.findAll(user.id)
  }

  /**
   * Update a specific provider type
   * @param user
   * @param providerType
   * @param updateProviderDto
   * @returns
   */

  @Put('/me/providers/:providerType')
  update(
    @User() user: AuthenticatedUser,
    @Param('providerType') providerType: ProviderType,
    @Body() updateProviderDto: UpdateProviderDto
  ) {
    return this.providersService.update(
      user.id,
      providerType,
      updateProviderDto
    )
  }

  /**
   * Remove a specific provider
   * @param user
   * @param providerType
   * @returns
   */
  @Delete('/me/providers/:providerType')
  remove(
    @User() user: AuthenticatedUser,
    @Param('providerType') providerType: ProviderType
  ) {
    return this.providersService.remove(user.id, providerType)
  }
}

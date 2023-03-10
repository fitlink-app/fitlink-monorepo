import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { CreateManualProviderDto } from './dto/create-manual-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { ProviderType } from './providers.constants'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponses, ValidationResponse } from '../../decorators/swagger.decorator'
import { Provider } from './entities/provider.entity'
import { DeleteResult } from 'typeorm'
import { WebhookRefreshTokenDto, WebhookRefreshTokenResponseDto } from './dto/refresh-token.dto'
import { RenewWebhookDto } from './dto/renew-webhook.dto'

@Controller()
@ApiTags('providers')
@ApiBaseResponses()
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
   *
   *
   */
  @Post('/me/providers')
  @ApiResponse({ type: Provider, status: 201 })
  link(
    @Body() createProviderDto: CreateManualProviderDto,
    @User() user: AuthenticatedUser
  ) {
    return this.providersService.createManual(createProviderDto, user.id)
  }

  @Post('/me/providers/webhook/refresh')
  @ValidationResponse()
  @ApiResponse({ type: WebhookRefreshTokenResponseDto, status: 200 })
  refresh(@Body() { refresh_token }: WebhookRefreshTokenDto) {
    return this.providersService.refreshSessionToken(refresh_token);
  }


  @Post('/me/providers/webhook/renew')
  @ValidationResponse()
  @ApiResponse({ type: WebhookRefreshTokenResponseDto, status: 200 })
  renew(@Body() {  deviceId, providerId }: RenewWebhookDto) {
    return this.providersService.renewWebhook(providerId, deviceId);
  }





  /**
   * Get the authenticated user's providers
   *
   * @param user
   * @returns
   */
  @Get('/me/providers')
  @ApiResponse({ type: Provider, status: 200, isArray: true })
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
  @ApiResponse({ type: Provider, status: 200 })
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
  @ApiResponse({ type: DeleteResult, status: 200 })
  remove(
    @User() user: AuthenticatedUser,
    @Param('providerType') providerType: ProviderType
  ) {
    return this.providersService.remove(user.id, providerType)
  }
}

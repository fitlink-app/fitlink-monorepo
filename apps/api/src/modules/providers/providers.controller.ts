import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { ProviderType } from './entities/provider.entity'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { ApiTags } from '@nestjs/swagger'

@Controller('providers')
@ApiTags('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('/users')
  create(
    @Body() createProviderDto: CreateProviderDto,
    @User() user: AuthenticatedUser
  ) {
    return this.providersService.create(createProviderDto, user.id)
  }

  @Get('/users')
  findAll(@User() user: AuthenticatedUser) {
    return this.providersService.findAll(user.id)
  }

  @Put(':providerType/')
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

  @Delete(':providerType')
  remove(
    @User() user: AuthenticatedUser,
    @Param('providerType') providerType: ProviderType
  ) {
    return this.providersService.remove(user.id, providerType)
  }
}

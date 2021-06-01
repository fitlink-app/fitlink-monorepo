import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { ProviderType } from './entities/provider.entity'

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  create(
    @Body() createProviderDto: CreateProviderDto,
    @User() user: AuthenticatedUser
  ) {
    return this.providersService.create(createProviderDto, user.id)
  }

  @Get()
  findAll() {
    return this.providersService.findAll()
  }

  @Put(':userId/:providerType/')
  update(
    @Param('userId') id: string,
    @Param('providerType') providerType: ProviderType,
    @Body() updateProviderDto: UpdateProviderDto
  ) {
    return this.providersService.update(id, providerType, updateProviderDto)
  }

  @Delete(':userId/:providerType')
  remove(
    @Param('userId') id: string,
    @Param('providerType') providerType: ProviderType
  ) {
    return this.providersService.remove(id, providerType)
  }
}

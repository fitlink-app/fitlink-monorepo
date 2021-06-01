import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { ProviderType } from './entities/provider.entity'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Iam(Roles.Self)
  @Post('/users/:userId')
  create(
    @Body() createProviderDto: CreateProviderDto,
    @Param('userId') userId: string
  ) {
    return this.providersService.create(createProviderDto, userId)
  }

  @Get('/users/:userId')
  @Iam(Roles.Self)
  findAll(@Param('userId') userId: string) {
    return this.providersService.findAll(userId)
  }

  @Iam(Roles.Self)
  @Put(':userId/:providerType/')
  update(
    @Param('userId') id: string,
    @Param('providerType') providerType: ProviderType,
    @Body() updateProviderDto: UpdateProviderDto
  ) {
    return this.providersService.update(id, providerType, updateProviderDto)
  }

  @Iam(Roles.Self)
  @Delete(':userId/:providerType')
  remove(
    @Param('userId') id: string,
    @Param('providerType') providerType: ProviderType
  ) {
    return this.providersService.remove(id, providerType)
  }
}

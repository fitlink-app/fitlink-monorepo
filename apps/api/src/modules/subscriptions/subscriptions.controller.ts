import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // @Post()
  // create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
  //   return this.subscriptionsService.create(createSubscriptionDto)
  // }

  // @Get()
  // findAll() {
  //   return this.subscriptionsService.findAll()
  // }

  @Iam(Roles.SubscriptionAdmin)
  @Get(':subscriptionId')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id)
  }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSubscriptionDto: UpdateSubscriptionDto
  // ) {
  //   return this.subscriptionsService.update(+id, updateSubscriptionDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.subscriptionsService.remove(+id)
  // }
}

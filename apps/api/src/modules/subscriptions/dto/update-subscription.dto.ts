import { PartialType } from '@nestjs/mapped-types'
import { CreateDefaultSubscriptionDto } from './create-default-subscription.dto'

export class UpdateSubscriptionDto extends PartialType(CreateDefaultSubscriptionDto) {}

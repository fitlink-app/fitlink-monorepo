import { PartialType } from '@nestjs/mapped-types'
import { CreateFeedItemDto } from './create-feed-item.dto'

export class UpdateFeedItemDto extends PartialType(CreateFeedItemDto) {}

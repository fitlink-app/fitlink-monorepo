import { Injectable } from '@nestjs/common'
import { CreateFeedItemDto } from './dto/create-feed-item.dto'
import { UpdateFeedItemDto } from './dto/update-feed-item.dto'

@Injectable()
export class FeedItemsService {
  create(createFeedItemDto: CreateFeedItemDto) {
    return 'This action adds a new feedItem'
  }

  findAll() {
    return `This action returns all feedItems`
  }

  findOne(id: number) {
    return `This action returns a #${id} feedItem`
  }

  update(id: number, updateFeedItemDto: UpdateFeedItemDto) {
    return `This action updates a #${id} feedItem`
  }

  remove(id: number) {
    return `This action removes a #${id} feedItem`
  }
}

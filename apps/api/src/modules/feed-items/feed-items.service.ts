import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { CreateFeedItemDto } from './dto/create-feed-item.dto'
import { UpdateFeedItemDto } from './dto/update-feed-item.dto'
import { FeedItem } from './entities/feed-item.entity'

@Injectable()
export class FeedItemsService {
  constructor(
    @InjectRepository(FeedItem)
    private feedItemRepository: Repository<FeedItem>
  ) {}
  async create(createFeedItemDto: CreateFeedItemDto) {
    const [result, resultErr] = await tryAndCatch(
      this.feedItemRepository.save(
        this.feedItemRepository.create(createFeedItemDto)
      )
    )
    resultErr && console.error(resultErr.message)
    return result
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

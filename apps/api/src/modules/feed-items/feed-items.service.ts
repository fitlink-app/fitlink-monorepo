import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToClass } from 'class-transformer'
import { Repository } from 'typeorm'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { UserPublic } from '../users/entities/user.entity'
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

  async findUserFeedItems(userId: string, { limit, page }: PaginationQuery) {
    const [results, total] = await this.feedItemRepository.findAndCount({
      where: {
        user: userId
      },
      take: limit,
      skip: limit * page,
      relations: [
        'user',
        'related_user',
        'reward',
        'league',
        'health_activity',
        'goal_entry',
        'likes'
      ]
    })

    return new Pagination<FeedItem>({
      results: results.map((item) => {
        if (item.user) {
          item.user = plainToClass(UserPublic, item.user)
          item.related_user = plainToClass(UserPublic, item.user)
        }
        return item
      }),
      total
    })
  }

  async like(feedItemId: string, userId: string) {
    return this.feedItemRepository
      .createQueryBuilder()
      .relation(FeedItem, 'users')
      .of(feedItemId)
      .add(userId)
  }

  async unLike(feedItemId: string, userId: string) {
    return this.feedItemRepository
      .createQueryBuilder()
      .relation(FeedItem, 'users')
      .of(feedItemId)
      .remove(userId)
  }
}

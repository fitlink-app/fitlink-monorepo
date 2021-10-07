import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ForbiddenException,
  Query
} from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { CreateFeedItemDto } from './dto/create-feed-item.dto'
import { UpdateFeedItemDto } from './dto/update-feed-item.dto'
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { PaginationBody } from '../../decorators/swagger.decorator'
import { FeedFilterDto } from './dto/feed-filter.dto'

@Controller()
export class FeedItemsController {
  constructor(private readonly feedItemsService: FeedItemsService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createFeedItemDto: CreateFeedItemDto) {
    return this.feedItemsService.create(createFeedItemDto)
  }

  @Get('/me/feed')
  @ApiTags('me')
  findMyFeedItems(
    @AuthUser() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery,
    @Query() { friends_activities, my_goals, my_updates }: FeedFilterDto
  ) {
    return this.feedItemsService.findAccessibleFeedItems(
      user.id,
      user.id,
      pagination,
      {
        friends_activities: !!Number(friends_activities),
        my_goals: !!Number(my_goals),
        my_updates: !!Number(my_updates)
      }
    )
  }

  @Get('/users/:userId/feed')
  @ApiTags('users')
  @PaginationBody()
  async findAllUserFeedItems(
    @Param('userId') id: string,
    @AuthUser() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.feedItemsService.findAccessibleFeedItems(
      id,
      user.id,
      pagination
    )
  }

  @Post('/users/:userId/feed/:feedItemId/like')
  @ApiTags('users')
  async likeFeedItem(
    @Param('userId') id: string,
    @Param('feedItemId') feedItemId: string,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.feedItemsService.like(feedItemId, user.id)
  }

  @Delete('/users/:userId/feed/:feedItemId/like')
  @ApiTags('users')
  async unlikeFeedItem(
    @Param('userId') id: string,
    @Param('feedItemId') feedItemId: string,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.feedItemsService.unLike(feedItemId, user.id)
  }

  /**
   * A user may choose to delete a feed item
   * if they don't want it to be shown on their feed
   * or on the feed of others
   *
   * @param feedItemId
   * @param user
   * @returns
   */
  @Delete('/me/feed/:feedItemId')
  @ApiTags('me')
  async deleteFeedItem(
    @Param('feedItemId') feedItemId: string,
    @AuthUser() user: AuthenticatedUser
  ) {
    const result = await this.feedItemsService.remove(feedItemId, user.id)
    if (!result) {
      throw new ForbiddenException()
    } else {
      return result
    }
  }
}

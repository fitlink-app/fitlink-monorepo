import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
} from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { CreateFollowingDto } from './dto/create-following.dto'
@Controller('followings')
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) {}

  @Post()
  create(@Request() request, @Body() body: CreateFollowingDto) {
    return this.followingsService.create(request.user.id, body)
  }

  /**
   * Get following entities with all user's followings by Id
   */
  @Get()
  findAllFollowing(@Request() request) {
    return this.followingsService.findAllFollowing(request.user.id, {
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,
      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  /**
   * Get following entities with all user's followers by Id
   */
  @Get('followers')
  findAllFollowers(@Request() request) {
    return this.followingsService.findAllFollowers(request.user.id, {
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,
      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  @Delete(':targetId')
  removeFollower(
    @Request() request,
    @Param('targetId') targetId: string
  ) {
    return this.followingsService.remove(request.user.id, targetId)
  }
}


import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseInterceptors,
  UseGuards
} from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { CreateFollowingDto } from './dto/create-following.dto'
import { AuthGuard } from '../../guards/auth.guard'
import { NotFoundInterceptor } from '../../interceptors/notfound.interceptor'
import { Public } from '../../decorators/public.decorator'

@Public()
@Controller('followings')
@UseGuards(AuthGuard)
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) {}

  @Post()
  create(@Body() createFollowingDto: CreateFollowingDto) {
    return this.followingsService.create(createFollowingDto)
  }

  /**
   * Get following entities with all user's followings by Id
   */
  @Get('follower/:followerId')
  findAllFollowing(@Param('followerId') followerId: string, @Request() request) {
    return this.followingsService.findAllFollowing(followerId, {
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
  @Get('following/:followingId')
  findAllFollowers(@Param('followingId') followingId: string, @Request() request) {
    return this.followingsService.findAllFollowers(followingId, {
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,
      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  /**
   * Get following entity for two users
   */
  @Get('follower/:followerId/following/:followingId')
  @UseInterceptors(
    new NotFoundInterceptor('No following entry found for given follower and following')
  )
  isFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followingsService.findOne(followerId, followingId)
  }

  @Get('following/:followingId/follower/:followerId')
  @UseInterceptors(
    new NotFoundInterceptor('No following entry found for given follower and following')
  )
  isFollower(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followingsService.findOne(followerId, followingId)
  }


  @Put('follower/:followerId/following/:followingId')
  updateFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
    @Body() updateFollowingDto: CreateFollowingDto
  ) {
    return this.followingsService.create({
      ...updateFollowingDto,
      followerId: followerId,
      followingId: followingId
    })
  }

  @Put('following/:followingId/follower/:followerId')
  updateFollower(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
    @Body() updateFollowingDto: CreateFollowingDto
  ) {
    return this.followingsService.create({
      ...updateFollowingDto,
      followerId: followerId,
      followingId: followingId
    })
  }

  @Delete()
  removeFollower(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followingsService.remove(followerId, followingId)
  }
}

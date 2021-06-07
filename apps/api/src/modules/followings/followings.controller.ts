import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Query
} from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { CreateFollowingDto } from './dto/create-following.dto'
import { AuthenticatedUser } from '../../models'
import { User } from '../../decorators/authenticated-user.decorator'
import { PaginationDto } from '../../helpers/paginate'
import {
  ApiBaseResponses,
  DeleteResponse
} from '../../decorators/swagger.decorator'
import { ApiResponse } from '@nestjs/swagger'
import { Following } from './entities/following.entity'
import { UserPublic } from '../users/entities/user.entity'

@ApiBaseResponses()
@Controller()
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) {}

  /**
   * Follows a user (targetId)
   * @param body `{ targetId: string }`
   * @returns
   */
  @Post('me/following')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  create(@User() user: AuthenticatedUser, @Body() body: CreateFollowingDto) {
    return this.followingsService.create(user.id, body)
  }

  /**
   * Get all users that the self-user is following
   */
  @Get('me/following')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  findAllFollowing(
    @Query() query: PaginationDto,
    @User() user: AuthenticatedUser
  ) {
    return this.followingsService.findAllFollowing(user.id, {
      limit: parseInt(query.limit) || 10,
      page: parseInt(query.page) || 0
    })
  }

  /**
   * Get following entities with all user's followers by Id
   */
  @Get('me/followers')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  findAllFollowers(
    @Query() query: PaginationDto,
    @User() user: AuthenticatedUser
  ) {
    return this.followingsService.findAllFollowers(user.id, {
      limit: parseInt(query.limit) || 10,
      page: parseInt(query.page) || 0
    })
  }

  /**
   * Unfollowing a user
   * @param request
   * @param targetId
   * @returns DeleteResult
   */
  @Delete('me/followings/:targetId')
  @DeleteResponse()
  removeFollower(@Request() request, @Param('targetId') targetId: string) {
    return this.followingsService.remove(request.user.id, targetId)
  }
}

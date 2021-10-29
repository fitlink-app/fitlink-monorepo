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
import { PaginationDto, PaginationQuery } from '../../helpers/paginate'
import {
  ApiBaseResponses,
  DeleteResponse,
  PaginationBody
} from '../../decorators/swagger.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Following } from './entities/following.entity'
import { UserPublic } from '../users/entities/user.entity'
import { Pagination } from '../../decorators/pagination.decorator'

@ApiBaseResponses()
@Controller()
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) {}

  /**
   * Follows a user (targetId)
   * @param body `{ targetId: string }`
   * @returns
   */
  @ApiTags('me')
  @Post('me/following')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  create(@User() user: AuthenticatedUser, @Body() body: CreateFollowingDto) {
    return this.followingsService.create(user.id, body)
  }

  /**
   * Get all users that the self-user is following
   */
  @ApiTags('me')
  @Get('me/following')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  @PaginationBody()
  findAllFollowing(
    @User() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.followingsService.findAllFollowing(user.id, pagination)
  }

  /**
   * Get following entities with all user's followers by Id
   */
  @ApiTags('me')
  @Get('me/followers')
  @ApiResponse({ type: UserPublic, isArray: true, status: 201 })
  @PaginationBody()
  findAllFollowers(
    @User() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.followingsService.findAllFollowers(user.id, pagination)
  }

  /**
   * Unfollowing a user
   * @param request
   * @param targetId
   * @returns DeleteResult
   */
  @ApiTags('me')
  @Delete('me/following/:userId')
  @DeleteResponse()
  removeFollower(
    @Param('userId') targetId: string,
    @User() user: AuthenticatedUser
  ) {
    return this.followingsService.remove(user.id, targetId)
  }
}

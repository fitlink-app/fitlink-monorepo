import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpCode
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import {
  UpdateUserAvatarDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  VerifyUserEmailDto
} from './dto/update-user.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { User, UserPublic } from '../users/entities/user.entity'
import { AuthenticatedUser } from '../../models'
import {
  ApiResponse,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiBearerAuth
} from '@nestjs/swagger'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse,
  PaginationBody
} from '../../decorators/swagger.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { JWTRoles } from '../../models'
// import { Public } from '../../decorators/public.decorator'
import { SearchUserDto } from './dto/search-user.dto'
import { Public } from '../../decorators/public.decorator'
import { Pagination } from '../../decorators/pagination.decorator'

@Controller()
@ApiBaseResponses()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User endpoints (requires JWT)
  @Get('me')
  @ApiTags('me')
  @ApiResponse({ type: User, status: 200 })
  findSelf(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id)
  }

  @Put('me')
  @ApiTags('me')
  @ApiResponse({ type: User, status: 200 })
  updateSelf(@AuthUser() user: AuthenticatedUser, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body)
  }

  @Delete('me')
  @ApiTags('me')
  @DeleteResponse()
  deleteSelf(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.remove(user.id)
  }

  @Put('me/avatar')
  @ApiTags('me')
  @UpdateResponse()
  @ApiBody({ type: UpdateUserAvatarDto })
  deleteAvatar(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: UpdateUserAvatarDto
  ) {
    return this.usersService.updateAvatar(user.id, body.imageId)
  }

  @Put('me/email')
  @ApiTags('me')
  @UpdateResponse()
  @ApiBody({ type: UpdateUserEmailDto })
  updateEmail(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: UpdateUserEmailDto
  ) {
    try {
      return this.usersService.updateEmail(user.id, body.email)
    } catch (e) {
      console.error(e)
      throw new BadRequestException(e)
    }
  }

  @Put('me/password')
  @ApiTags('me')
  @UpdateResponse()
  @ApiBody({ type: UpdateUserPasswordDto })
  async updatePassword(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: UpdateUserPasswordDto
  ) {
    const result = await this.usersService.verifyAndUpdatePassword(
      user.id,
      body.current_password,
      body.new_password
    )

    if (!result) {
      throw new BadRequestException(
        'Unable to reset your password, did you type your previous password correctly?'
      )
    }

    return result
  }

  @Public()
  @Post('users/verify-email')
  @UpdateResponse()
  @HttpCode(200)
  @ApiTags('users')
  @ApiBody({ type: VerifyUserEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyUserEmailDto) {
    const result = await this.usersService.verifyEmail(verifyEmailDto.token)
    if (!result) {
      throw new BadRequestException('The token is expired or invalid')
    } else {
      return result
    }
  }

  @Delete('me/avatar')
  @ApiTags('me')
  @UpdateResponse()
  updateAvatar(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.deleteAvatar(user.id)
  }

  @ApiExcludeEndpoint()
  @ApiTags('users')
  @Post('users')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Iam(Roles.SuperAdmin)
  @Get('users')
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAll(@Pagination() pagination: PaginationQuery) {
    return this.usersService.findAllUsers(pagination)
  }

  /**
   * Searches for users by keyword
   * and associates the search to the auth
   * user to determine follower/following relationships
   *
   * @param query
   * @returns paginated users
   */
  @Get('users/search')
  @ApiTags('users')
  @PaginationBody()
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: UserPublic, isArray: true, status: 200 })
  search(
    @Query() query: SearchUserDto,
    @Pagination() pagination: PaginationQuery,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.usersService.searchByNameOrEmail(query.q, user.id, pagination)
  }

  @Get('users/:userId')
  @ApiTags('users')
  @ApiResponse({ type: UserPublic, status: 200 })
  async findOne(
    @Param('userId') id: string,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.usersService.findPublic(id, user.id)
  }

  @Iam(Roles.SuperAdmin)
  @ApiTags('users')
  @UpdateResponse()
  @Put('users/:userId')
  update(@Param('userId') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Iam(Roles.SuperAdmin)
  @ApiTags('users')
  @DeleteResponse()
  @Delete('users/:userId')
  remove(@Param('userId') id: string) {
    return this.usersService.remove(id)
  }

  @ApiTags('users')
  @Get('users/getRolesForToken/:userId')
  @ApiResponse({ type: JWTRoles, status: 200 })
  getRolesForToken(@Param('userId') userId: string) {
    return this.usersService.getRolesForToken({ id: userId } as any)
  }
}

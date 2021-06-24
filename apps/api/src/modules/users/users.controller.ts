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
import { Roles } from '../user-roles/entities/user-role.entity'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { User, UserPublic } from '../users/entities/user.entity'
import { AuthenticatedUser } from '../../models'
import {
  ApiResponse,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiBody
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

@Controller()
@ApiBaseResponses()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User endpoints (requires JWT)
  @Get('me')
  @ApiResponse({ type: User, status: 200 })
  findSelf(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id)
  }

  @Put('me')
  @ApiResponse({ type: User, status: 200 })
  updateSelf(@AuthUser() user: AuthenticatedUser, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body)
  }

  @Delete('me')
  @DeleteResponse()
  deleteSelf(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.remove(user.id)
  }

  @Put('me/avatar')
  @UpdateResponse()
  @ApiBody({ type: UpdateUserAvatarDto })
  deleteAvatar(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: UpdateUserAvatarDto
  ) {
    return this.usersService.updateAvatar(user.id, body.imageId)
  }

  @Put('me/email')
  @UpdateResponse()
  @ApiBody({ type: UpdateUserEmailDto })
  updateEmail(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: UpdateUserEmailDto
  ) {
    try {
      return this.usersService.updateEmail(user.id, body.email)
    } catch (e) {
      throw new BadRequestException(e)
    }
  }

  @Put('me/password')
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
  @UpdateResponse()
  updateAvatar(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.deleteAvatar(user.id)
  }

  @ApiExcludeEndpoint()
  @Post('users')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Iam(Roles.SuperAdmin)
  @Get('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAll(@Query() query: PaginationQuery) {
    return this.usersService.findAllUsers({
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 0
    })
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
  @PaginationBody()
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: UserPublic, isArray: true, status: 200 })
  search(
    @Query() query: PaginationQuery & SearchUserDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.usersService.searchByName(query.q, user.id, {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 0
    })
  }

  @Get('users/:userId')
  @ApiResponse({ type: UserPublic, status: 200 })
  async findOne(@Param('userId') id: string) {
    return this.usersService.findPublic(id)
  }

  @Iam(Roles.SuperAdmin)
  @UpdateResponse()
  @Put('users/:userId')
  update(@Param('userId') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Iam(Roles.SuperAdmin)
  @DeleteResponse()
  @Delete('users/:userId')
  remove(@Param('userId') id: string) {
    return this.usersService.remove(id)
  }

  @Get('users/getRolesForToken/:userId')
  @ApiResponse({ type: JWTRoles, status: 200 })
  getRolesForToken(@Param('userId') userId: string) {
    return this.usersService.getRolesForToken({ id: userId } as any)
  }
}

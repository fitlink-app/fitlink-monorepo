import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserAvatarDto, UpdateUserDto } from './dto/update-user.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { User, UserPublic } from '../users/entities/user.entity'
import { AuthenticatedUser } from '../../models'
import {
  ApiResponse,
  ApiExcludeEndpoint,
  ApiQuery,
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
  updateSelf(
    @AuthUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(user.id, updateUserDto)
  }

  @Delete('me')
  @DeleteResponse()
  deleteSelf(@AuthUser() user: AuthenticatedUser) {
    return this.usersService.remove(user.id)
  }

  @Put('me/avatar')
  @UpdateResponse()
  deleteAvatar(
    @AuthUser() user: AuthenticatedUser,
    @Body() updateUserAvatarDto: UpdateUserAvatarDto
  ) {
    return this.usersService.updateAvatar(user.id, updateUserAvatarDto.imageId)
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
   * @param query
   * @returns paginated users
   */
  @Get('users/search')
  @PaginationBody()
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: UserPublic, isArray: true, status: 200 })
  search(@Query() query: PaginationQuery & SearchUserDto) {
    return this.usersService.searchByName(query.q, {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 0
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get('users/:userId')
  @ApiResponse({ type: User, status: 200 })
  findOne(@Param('userId') id: string) {
    return this.usersService.findOne(id)
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

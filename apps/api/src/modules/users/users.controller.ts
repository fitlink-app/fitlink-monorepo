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
  HttpCode,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import {
  UpdateBasicUserDto,
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
import { FilterUserDto, SearchUserDto } from './dto/search-user.dto'
import { Public } from '../../decorators/public.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateAdminDto } from './dto/create-admin.dto'
import { ConfigService } from '@nestjs/config'
import { UserJobDto } from './dto/user-job.dto'
import { CreateFcmTokenDto } from './dto/create-fcm-token.dto'
import { DeleteFcmTokenDto } from './dto/delete-fcm-token.dto'
import { Events } from '../../events'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Controller()
@ApiBaseResponses()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {}

  // User endpoints (requires JWT)
  @Get('me')
  @ApiTags('me')
  @ApiResponse({ type: User, status: 200 })
  async findSelf(@AuthUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.findOne(authUser.id)
    if (!user) {
      throw new NotFoundException()
    }
    return user
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
  async deleteSelf(@AuthUser() user: AuthenticatedUser) {
    const result = await this.usersService.remove(user.id)
    if (!result) {
      throw new BadRequestException(
        'Unable to delete user, or user does not exist. Please contact support.'
      )
    }
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

  @Post('me/fcm-token')
  @ApiTags('me')
  @UpdateResponse()
  @ApiBody({ type: CreateFcmTokenDto })
  updateFcmToken(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: CreateFcmTokenDto
  ) {
    try {
      return this.usersService.mergeFcmTokens(user.id, body.token)
    } catch (e) {
      console.error(e)
      throw new BadRequestException(e)
    }
  }

  @Post('me/remove-fcm-token')
  @ApiTags('me')
  removeFcmToken(
    @Body() { token }: DeleteFcmTokenDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    try {
      return this.usersService.removeFcmToken(user.id, token)
    } catch (e) {
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

  @Put('me/ping')
  @ApiTags('me')
  @UpdateResponse()
  async pingUser(@AuthUser() user: AuthenticatedUser) {
    await this.eventEmitter.emitAsync(Events.USER_PING, user)
    return this.usersService.ping(user.id)
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
      const link = this.usersService.generatePostEmailVerifyLink()
      return { ...result, link }
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
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAll(
    @Pagination() pagination: PaginationQuery,
    @Query() query: FilterUserDto
  ) {
    return this.usersService.findAllUsers(pagination, query)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/users')
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAllUsersWithinOrganisation(
    @Pagination() pagination: PaginationQuery,
    @Param('organisationId') organisationId: string,
    @Query() query: FilterUserDto
  ) {
    return this.usersService.findAllUsers(pagination, query, {
      organisationId
    })
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/users')
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAllUsersWithinTeam(
    @Pagination() pagination: PaginationQuery,
    @Param('teamId') teamId: string,
    @Query() query: FilterUserDto
  ) {
    return this.usersService.findAllUsers(pagination, query, {
      teamId
    })
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/users/:userId')
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, status: 200 })
  async getUserDetailInfo(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ) {
    const info = await this.usersService.findUserDetail(userId, teamId)
    if (!info) {
      throw new NotFoundException()
    }

    return info
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Get([
    '/organisations/:organisationId/subscriptions/:subscriptionId/admins',
    '/organisations/:organisationId/admins',
    '/organisations/:organisationId/teams/:teamId/admins',
    '/subscriptions/:subscriptionId/admins',
    '/teams/:teamId/admins',
    '/admins'
  ])
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAllAdmins(
    @Pagination() pagination: PaginationQuery,
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('teamId') teamId: string,
    @Query() query: FilterUserDto
  ) {
    return this.usersService.findAllAdmins(pagination, query, {
      subscriptionId,
      organisationId,
      teamId
    })
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Post([
    '/organisations/:organisationId/subscriptions/:subscriptionId/admins',
    '/organisations/:organisationId/teams/:teamId/admins',
    '/organisations/:organisationId/admins',
    '/admins'
  ])
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  createAdmin(
    @AuthUser() user: AuthenticatedUser,
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('teamId') teamId: string,
    @Body() { role, userId }: CreateAdminDto
  ) {
    if (user.isSuperAdmin() && !organisationId) {
      return this.userRolesService.assignSuperAdminRole(userId)
    } else {
      return this.userRolesService.assignAdminRole(userId, {
        role,
        organisationId,
        subscriptionId,
        teamId
      })
    }
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Delete([
    '/organisations/:organisationId/subscriptions/:subscriptionId/admins/:userId',
    '/organisations/:organisationId/teams/:teamId/admins/:userId',
    '/organisations/:organisationId/admins/:userId',
    '/admins/:userId'
  ])
  @ApiTags('users')
  @PaginationBody()
  @ApiResponse({ type: User, isArray: true, status: 200 })
  deleteAdmin(
    @AuthUser() user: AuthenticatedUser,
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ) {
    if (user.isSuperAdmin() && !organisationId) {
      if (user.id === userId) {
        throw new BadRequestException(
          'You may not remove yourself as superadmin'
        )
      }
      return this.userRolesService.deleteSuperAdminRole(userId)
    } else {
      if (organisationId && user.id === userId) {
        throw new BadRequestException(
          'You may not remove yourself as organisation admin.'
        )
      }
      return this.userRolesService.assignAdminRole(
        userId,
        {
          organisationId,
          subscriptionId,
          teamId
        },
        true
      )
    }
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
  update(
    @Param('userId') id: string,
    @Body() updateUserDto: UpdateBasicUserDto
  ) {
    return this.usersService.updateBasic(id, updateUserDto)
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

  /**
   * Webhook for AWS Lambda to update leagues
   */
  @Public()
  @Post('/users/job')
  async processRankChange(@Body() { verify_token }: UserJobDto) {
    if (verify_token !== this.configService.get('JOBS_VERIFY_TOKEN')) {
      throw new ForbiddenException()
    }
    const [rank] = await Promise.all([
      this.usersService.processPendingRankDrops()
    ])

    return {
      rank
    }
  }

  /**
   * Webhook for AWS Lambda to send a Monday
   * reminder for inactive users.
   */
  @Public()
  @Post('/users/job/mondays')
  async mondayReminders(@Body() { verify_token }: UserJobDto) {
    if (verify_token !== this.configService.get('JOBS_VERIFY_TOKEN')) {
      throw new ForbiddenException()
    }
    const result = await this.usersService.processMondayMorningReminder()
    return result
  }

  @Get('/me/points')
  @ApiTags('me')
  getUserPointsDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @AuthUser() user: AuthenticatedUser
  ) {
    return this.usersService.getUsersPointsForDateRange(user.id, startDate, endDate)
  }
}

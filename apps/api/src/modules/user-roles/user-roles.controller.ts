import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { UserRolesService } from './user-roles.service'
import { CreateUserRoleDto } from './dto/create-user-role.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles, UserRole } from './entities/user-role.entity'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'

@ApiBaseResponses()
@Controller()
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  /**
   * Gets the self-user's roles
   * @returns UserRole[]
   */

  @Get('me/roles')
  @ApiTags('me')
  @ApiResponse({ type: UserRole, isArray: true, status: 200 })
  findMyRoles(@User() user: AuthenticatedUser) {
    return this.userRolesService.getAllUserRoles(user.id)
  }

  /**
   * Deletes a role for the self-user
   * @param roleId
   * @param userId
   * @returns
   */
  @Delete('me/roles/:roleId')
  @ApiTags('me')
  @DeleteResponse()
  removeMyRole(
    @User() user: AuthenticatedUser,
    @Param('roleId') roleId: string
  ) {
    return this.userRolesService.remove(roleId, null, user.id)
  }

  /**
   * Assigns the superadmin role to a specific user. Can only be performed
   * by another superadmin.
   * @param userId
   */
  @Iam(Roles.SuperAdmin)
  @ApiTags('roles')
  @Post('/roles/superadmin/:userId')
  @ApiResponse({ type: UserRole, status: 201 })
  createNewSuperAdmin(@Param('userId') userId: string) {
    return this.userRolesService.assignSuperAdminRole(userId)
  }

  /**
   * Creates a role for a user within an organisation
   * @param createUserRoleDto
   * @param organisationId
   * @param userId
   */
  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @ApiTags('roles')
  @Post('/organisations/:organisationId/users/:userId/roles')
  @ApiResponse({ type: UserRole, status: 201 })
  create(
    @Body() createUserRoleDto: CreateUserRoleDto,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string
  ) {
    return this.userRolesService.create(
      createUserRoleDto,
      userId,
      organisationId
    )
  }

  /**
   * Gets a users roles (performed by organisation admin)
   * @param userId
   * @returns
   */
  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @ApiTags('roles')
  @Get('/organisations/:organisationId/users/:userId/roles')
  @ApiResponse({ type: UserRole, isArray: true, status: 200 })
  findOne(@Param('userId') userId: string) {
    return this.userRolesService.getAllUserRoles(userId)
  }

  /**
   * Updates a users roles within an organisation
   * (performed by organisation admin)
   * @param updateUserRoleDto
   * @param roleId
   * @param organisationId
   * @param userId
   * @returns
   */
  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Put('/organisations/:organisationId/users/:userId/roles/:roleId')
  @ApiTags('roles')
  @UpdateResponse()
  @ApiBody({ type: CreateUserRoleDto })
  update(
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Param('roleId') id: string
  ) {
    return this.userRolesService.update(
      updateUserRoleDto,
      id,
      organisationId,
      userId
    )
  }

  /**
   * Deletes a role for a user within an organisation
   * (performed by organisation admin or )
   * @param roleId
   * @param organisationId
   * @param userId
   * @returns
   */
  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @ApiTags('roles')
  @Delete('/organisations/:organisationId/users/:userId/roles/:roleId')
  @DeleteResponse()
  remove(
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string
  ) {
    return this.userRolesService.remove(roleId, organisationId, userId)
  }
}

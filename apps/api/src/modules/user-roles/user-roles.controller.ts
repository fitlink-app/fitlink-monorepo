import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { UserRolesService } from './user-roles.service'
import { CreateUserRoleDto } from './dto/create-user-role.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from './entities/user-role.entity'

@Controller()
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Iam(Roles.SuperAdmin)
  @Post('/roles/superadmin/:userId')
  createNewSuperAdmin(@Param('userId') userId: string) {
    return this.userRolesService.assignSuperAdminRole(userId)
  }

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Post('/organisations/:organisationId/users/:userId/roles')
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

  @Iam(Roles.Self)
  @Get('/organisations/:organisationId/roles/users/:userId')
  findOne(@Param('userId') id: string) {
    return this.userRolesService.getAllUserRoles(id)
  }

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Put('/organisations/:organisationId/users/:userId/roles/:id')
  update(
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Param('id') id: string,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string
  ) {
    return this.userRolesService.update(
      updateUserRoleDto,
      id,
      organisationId,
      userId
    )
  }

  @Iam(Roles.Self)
  @Delete('/organisations/:organisationId/users/:userId/roles/:id')
  remove(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string
  ) {
    return this.userRolesService.remove(id, organisationId, userId)
  }
}

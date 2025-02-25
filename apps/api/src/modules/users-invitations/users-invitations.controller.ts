import { Controller, Post, Body } from '@nestjs/common'
import { UsersInvitationsService } from './users-invitations.service'
import {
  CreateUsersInvitationDto,
  CreateUsersInvitationResultDto
} from './dto/create-users-invitation.dto'
import { VerifyUsersInvitationDto } from './dto/verify-users-invitation.dto'
import { Public } from '../../decorators/public.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { UsersService } from '../users/users.service'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserInvitationJWT } from '../../models/user-invitation.jwt.model'

@ApiTags('users')
@ApiBaseResponses()
@Controller()
export class UsersInvitationsController {
  constructor(
    private readonly usersInvitationsService: UsersInvitationsService,
    private readonly usersService: UsersService
  ) {}

  @Post('users-invitations')
  @ApiResponse({ type: CreateUsersInvitationResultDto, status: 201 })
  async create(
    @Body() createUsersInvitationDto: CreateUsersInvitationDto,
    @User() user: AuthenticatedUser
  ) {
    return this.usersInvitationsService.create(
      user.id,
      createUsersInvitationDto
    )
  }

  /**
   * Verifies and retrieves the token payload.
   *
   * Throws an UnauthorizedException if the token is no
   * longer valid. However, the token is set to last for 1
   * year, since it's just an invitation to the service.
   *
   * @param token
   * @returns JWT data
   */
  @Public()
  @Post('users-invitations/verify')
  @ApiResponse({ type: UserInvitationJWT, status: 200 })
  verify(@Body() { token }: VerifyUsersInvitationDto) {
    return this.usersInvitationsService.readToken(token)
  }
}

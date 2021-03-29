import { Controller, Post, Body } from '@nestjs/common'
import { UsersInvitationsService } from './users-invitations.service'
import { CreateUsersInvitationDto } from './dto/create-users-invitation.dto'
import { VerifyUsersInvitationDto } from './dto/verify-users-invitation.dto'
import { Public } from '../../decorators/public.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { UsersService } from '../users/users.service'

@Controller()
export class UsersInvitationsController {
  constructor(
    private readonly usersInvitationsService: UsersInvitationsService,
    private readonly usersService: UsersService
  ) {}

  @Post('users-invitations')
  async create(
    @Body() createUsersInvitationDto: CreateUsersInvitationDto,
    @User() user: AuthenticatedUser
  ) {
    const inviter = await this.usersService.findOne(user.id)
    return this.usersInvitationsService.create({
      ...createUsersInvitationDto,
      ...{ inviter }
    })
  }

  /**
   * Verifies and retrieves the token payload.
   *
   * Throws an UnauthorizedException if the token is no
   * longer valid.
   *
   * @param token
   * @returns boolean
   */
  @Public()
  @Post('users-invitations/verify')
  verify(@Body() { token }: VerifyUsersInvitationDto) {
    return this.usersInvitationsService.readToken(token)
  }
}

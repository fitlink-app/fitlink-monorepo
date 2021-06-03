import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { Public } from '../../decorators/public.decorator'

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('auth/login')
  async login(@Request() request) {
    return this.authService.login(request.user)
  }

  /**
   * Logout is not technically possible with JWTs
   * The front end SDK will need to destroy the token from memory.
   * But we should store the last_logout_at date in the database
   * TODO: Change user entity to accept this date
   *
   * @returns
   */
  @Post('auth/logout')
  async logout() {
    return { success: true }
  }

  @Get('me')
  async me(@User() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id)
  }
}

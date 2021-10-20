import {
  Controller,
  Request,
  Post,
  Put,
  UseGuards,
  Get,
  Body,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { AuthService } from './auth.service'
import { Public } from '../../decorators/public.decorator'
import { AuthLoginDto, AuthConnectDto } from './dto/auth-login'
import { AuthSwitchDto } from './dto/auth-switch'
import { AuthResultDto, AuthLogoutDto, AuthSignupDto } from './dto/auth-result'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  SuccessResponse,
  UpdateResponse,
  ValidationResponse
} from '../../decorators/swagger.decorator'
import { CreateUserDto } from '../users/dto/create-user.dto'
import {
  CreateOrganisationAsUserDto,
  CreateUserWithOrganisationDto
} from '../users/dto/create-user-with-organisation.dto'
import {
  AuthResetPasswordDto,
  AuthRequestResetPasswordDto
} from './dto/auth-reset-password'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'

@Controller()
@ApiBaseResponses()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('auth')
  @ApiBody({ type: AuthLoginDto })
  @ApiResponse({ type: AuthResultDto, status: 200 })
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
  @ApiTags('auth')
  @Post('auth/logout')
  @ApiResponse({ type: AuthLogoutDto, status: 200 })
  async logout() {
    return { success: true }
  }

  @ApiTags('auth')
  @Post('auth/signup')
  @Public()
  @ValidationResponse()
  @ApiResponse({ type: AuthSignupDto, status: 200 })
  async signup(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.signup(createUserDto)

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    return result
  }

  @ApiTags('auth')
  @Post('auth/organisation')
  @Public()
  @ValidationResponse()
  @ApiResponse({ type: AuthSignupDto, status: 200 })
  async signupWithOrganisation(
    @Body() createUserDto: CreateUserWithOrganisationDto
  ) {
    const result = await this.authService.signupWithOrganisation(createUserDto)

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    return result
  }

  @ApiTags('auth')
  @Post('auth/new-organisation')
  @ValidationResponse()
  @ApiResponse({ type: AuthSignupDto, status: 200 })
  async signupNewOrganisation(
    @Body() createUserDto: CreateOrganisationAsUserDto,
    @User() user: AuthenticatedUser
  ) {
    const result = await this.authService.signupNewOrganisation(
      createUserDto,
      user.id
    )

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    return result
  }

  @ApiTags('auth')
  @Post('auth/request-password-reset')
  @Public()
  @SuccessResponse()
  async requestPasswordReset(
    @Body() requestPasswordDto: AuthRequestResetPasswordDto
  ) {
    return this.authService.requestPasswordReset(requestPasswordDto.email)
  }

  @ApiTags('auth')
  @Put('auth/reset-password')
  @Public()
  @UpdateResponse()
  @ValidationResponse()
  async resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto) {
    try {
      const result = await this.authService.resetPassword(resetPasswordDto)
      return result
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @ApiTags('auth')
  @Post('auth/connect')
  @Public()
  @ValidationResponse()
  @ApiResponse({ type: AuthSignupDto, status: 200 })
  async connect(@Body() authConnectDto: AuthConnectDto) {
    const { error, result } = await this.authService.connectWithAuthProvider(
      authConnectDto
    )
    if (error) {
      throw new BadRequestException(error)
    }

    return result
  }

  /**
   * Organisation and superadmin users are able to switch
   * to different "accounts", i.e. they can manage
   * teams directly as if they were team admins.
   *
   * @param authSwitchDto
   * @returns
   */

  @ApiTags('auth')
  @Post('auth/switch')
  @ValidationResponse()
  @ApiResponse({ type: AuthResultDto, status: 200 })
  async authSwitch(
    @Body() authSwitchDto: AuthSwitchDto,
    @User() authUser: AuthenticatedUser
  ) {
    const result = await this.authService.switchSession(
      authUser.id,
      authSwitchDto
    )

    if (!result) {
      throw new ForbiddenException('You do not have access to this resource')
    }

    return result
  }
}

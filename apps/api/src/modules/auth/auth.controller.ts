import {
  Controller,
  Request,
  Post,
  Put,
  UseGuards,
  Get,
  Body,
  BadRequestException
} from '@nestjs/common'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { AuthService } from './auth.service'
import { Public } from '../../decorators/public.decorator'
import { AuthLoginDto } from './dto/auth-login'
import { AuthResultDto, AuthLogoutDto, AuthSignupDto } from './dto/auth-result'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  SuccessResponse,
  UpdateResponse,
  ValidationResponse
} from '../../decorators/swagger.decorator'
import { CreateUserDto } from '../users/dto/create-user.dto'
import {
  AuthResetPasswordDto,
  AuthRequestResetPasswordDto
} from './dto/auth-reset-password'

@Controller()
@ApiBaseResponses()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Post('auth/logout')
  @ApiResponse({ type: AuthLogoutDto, status: 200 })
  async logout() {
    return { success: true }
  }

  @Post('auth/signup')
  @Public()
  @ValidationResponse()
  @ApiResponse({ type: AuthSignupDto, status: 200 })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto)
  }

  @Post('auth/request-password-reset')
  @Public()
  @SuccessResponse()
  async requestPasswordReset(
    @Body() requestPasswordDto: AuthRequestResetPasswordDto
  ) {
    return this.authService.requestPasswordReset(requestPasswordDto.email)
  }

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
}

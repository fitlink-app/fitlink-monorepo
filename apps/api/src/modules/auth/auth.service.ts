import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { plainToClass } from 'class-transformer'
import { Connection, Repository } from 'typeorm'
import { AuthenticatedUser } from '../../models'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { AuthResultDto } from './dto/auth-result'
import { RefreshToken } from './entities/auth.entity'
import { EmailService } from '../common/email.service'
import { ConfigService } from '@nestjs/config'
import { AuthResetPasswordDto } from './dto/auth-reset-password'

type PasswordResetToken = {
  sub: string
  iat: string
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    @InjectRepository(User)
    private refreshTokenRepository: Repository<RefreshToken>,
    private connection: Connection
  ) {}

  /**
   * Validates the user authentication
   * details and returns the authenticated
   * user entity.
   *
   * Used for the local guard/strategy
   *
   * @param email
   * @param password
   * @returns the authenticated user entity
   */
  async validateAndRetrieveUser(
    email: string,
    password: string
  ): Promise<User | false> {
    const user = await this.usersService.findByEmail(email)
    if (user) {
      const valid = await this.verifyPassword(password, user.password)
      if (valid) {
        return user
      }
    }

    return false
  }

  /**
   * Returns tokens for a particular user session
   *
   * Used for the local guard/strategy
   *
   * @param user
   * @returns object containing 3 tokens
   */
  async login(user: AuthenticatedUser | User): Promise<AuthResultDto> {
    const userEntity = await this.usersService.findOne(user.id)
    const refreshToken = await this.createRefreshToken(userEntity)

    return {
      access_token: await this.createAccessToken(userEntity),
      id_token: await this.createIdToken(userEntity),
      refresh_token: refreshToken
    }
  }

  /**
   * Signs up a user and immediately
   * creates tokens
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async signup(createUserDto: CreateUserDto) {
    const { email, name, password } = createUserDto
    const user = await this.usersService.create({
      name,
      email,
      password: await this.hashPassword(password)
    })

    return {
      auth: await this.login(user),
      me: plainToClass(User, user)
    }
  }

  /**
   * Access token is used for authorizing
   * API requests.
   *
   * @param user
   * @returns accessToken
   */
  async createAccessToken(user: User) {
    const payload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: user.id,
      iat: new Date().getTime(),
      roles: await this.usersService.getRolesForToken(user)
    }

    return this.jwtService.sign(payload)
  }

  /**
   * ID token is used to store
   * privileges for the client.
   * It should not be sent on
   * subsequent API requests.
   *
   * @param user
   * @returns idToken
   */
  async createIdToken(user: User) {
    const payload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: user.id,
      iat: new Date().getTime(),
      roles: await this.usersService.getRolesForToken(user),
      email: user.email,
      settings: user.settings
    }

    return this.jwtService.sign(payload, {
      expiresIn: '1h'
    })
  }

  /**
   * Refresh token is used to obtain
   * a new id and access token, but
   * cannot directly provide any privileges.
   *
   * It never expires, but it can be revoked.
   * Revocation is checked in validateRefreshToken
   * method in this service.
   *
   * It should only be sent when an access token
   * has expired.
   *
   * @param user
   * @returns refreshToken
   */
  async createRefreshToken(user: User) {
    const refreshTokenPayload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: user.id,
      iat: new Date().getTime(),
      _rft: true // Refresh token
    }

    const token = this.jwtService.sign(refreshTokenPayload)

    const refreshToken = new RefreshToken()
    refreshToken.token = token

    await this.connection
      .createQueryBuilder()
      .relation(User, 'refresh_tokens')
      .of(user)
      .add(refreshToken)

    return token
  }

  /**
   * Using the refresh token, attempts to retrieve
   * a new JWT token, but may fail due to revocation
   * @param token
   */
  async refreshSessionToken(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken)
    const userId = decoded.sub
    await this.validateRefreshToken(refreshToken, decoded)
    const user = await this.usersService.findOne(userId)
    return await this.createAccessToken(user)
  }

  /**
   * Validates the refresh token or throws
   * an exception.
   *
   *
   * @param refreshToken The token as a string
   * @param decoded The decoded token as an object
   */
  async validateRefreshToken(refreshToken, decoded) {
    const userId = decoded.sub

    if (!decoded._rft || !decoded.sub) {
      throw new HttpException(
        'Not a valid refresh token',
        HttpStatus.UNAUTHORIZED
      )
    }

    const token = await this.refreshTokenRepository.findOne({
      join: {
        alias: 'refresh_tokens',
        innerJoin: { user: 'refresh_token.user' }
      },
      where: (qb) => {
        qb.where({
          refreshToken
        }).andWhere(`refresh_tokens.revoked != 1 AND user.id == :id`, {
          id: userId
        })
      }
    })

    if (!token) {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED)
    }
  }

  /**
   * Hashes a password with bcrypt
   * @param password
   * @returns hashed password
   */
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  /**
   * Verifies a password with bcrypt
   * @param password
   * @param hash
   * @returns true if valid, otherwise false
   */
  async verifyPassword(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  }

  /**
   * Sends user a password reset link in an email
   * @param email
   * @returns
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (user) {
      const resetPasswordUrl = this.configService
        .get('RESET_PASSWORD_URL')
        .replace('{token}', this.getResetPasswordToken(user))
      await this.emailService.sendTemplatedEmail(
        'password-reset',
        {
          PASSWORD_RESET_LINK: resetPasswordUrl
        },
        [email]
      )
    }

    // The client should not be told whether or not this user exists
    return true
  }

  /**
   * Sends user a password reset link in an email
   * @param email
   * @returns
   */
  async resetPassword(resetPasswordDto: AuthResetPasswordDto) {
    const tokenData = this.jwtService.decode(
      resetPasswordDto.token
    ) as PasswordResetToken

    if (!tokenData) {
      throw new Error('Invalid token, or token may have expired')
    }

    const user = await this.usersService.findByEmail(tokenData.sub)

    if (user) {
      const issuedAt = new Date(tokenData.iat)
      if (user.password_reset_at > issuedAt) {
        throw new Error('You have already reset your password')
      }
      const password = await this.hashPassword(resetPasswordDto.password)
      return this.usersService.updatePassword(user.id, password)
    } else {
      throw new Error('User not found')
    }
  }

  /**
   * Generates a JWT for password reset
   * @param user The user retrieved by email
   * @returns The token
   */
  getResetPasswordToken(user: User) {
    const payload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: user.email,
      iat: new Date().getTime()
    }

    return this.jwtService.sign(payload, {
      expiresIn: '30m'
    })
  }
}

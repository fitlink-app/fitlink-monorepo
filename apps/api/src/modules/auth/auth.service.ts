import {
  BadRequestException,
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToClass } from 'class-transformer'
import { Connection, Repository } from 'typeorm'
import { AuthenticatedUser, JWTRoles } from '../../models'
import { CreateUserDto } from '../users/dto/create-user.dto'
import {
  CreateOrganisationAsUserDto,
  CreateUserWithOrganisationDto
} from '../users/dto/create-user-with-organisation.dto'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { AuthResultDto } from './dto/auth-result'
import { RefreshToken } from './entities/auth.entity'
import { AuthConnectDto } from './dto/auth-login'
import { EmailService } from '../common/email.service'
import { ConfigService } from '@nestjs/config'
import { AuthResetPasswordDto } from './dto/auth-reset-password'
import { AuthProvider } from './entities/auth-provider.entity'
import { AuthProviderType } from './auth.constants'
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuid } from 'uuid'
import { AuthSwitchDto } from './dto/auth-switch'
import { Roles } from '../user-roles/user-roles.constants'
import { Team } from '../teams/entities/team.entity'
import { OrganisationsService } from '../organisations/organisations.service'
import { OrganisationMode } from '../organisations/organisations.constants'
import { UserSettingsService } from '../users-settings/users-settings.service'
import { CommonService } from '../common/services/common.service'

type PasswordResetToken = {
  sub: string
  iat: string
}

export enum AuthServiceError {
  Provider = 'The provider is not valid',
  Email = 'An email is required',
  Exists = 'A user with this email already exists. Please log in instead.'
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private organisationsService: OrganisationsService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(AuthProvider)
    private authProviderRepository: Repository<AuthProvider>,

    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private connection: Connection,
    private httpService: HttpService,
    private userSettingsService: UserSettingsService,
    private commonService: CommonService
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
      // Legacy Firebase password check
      if (user.password.indexOf('__FIREBASE__') > 0) {
        const valid = await this.usersService.verifyFirebasePassword(
          password,
          user.password
        )
        if (valid) {
          // Here we update the password so we no longer need to use
          // firebase authentication
          const hashed = await this.usersService.hashPassword(password)
          await this.usersService.updatePassword(user.id, hashed)
          return user
        } else {
          return false
        }
      }

      // Standard password check
      const valid = await this.usersService.verifyPassword(
        password,
        user.password
      )
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

    await this.usersService.updateEntity(user.id, {
      last_login_at: new Date()
    })

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
   * TODO: This should fail gracefully if a user already exists
   * (it will fail already with a 500 error due to unique email column)
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async signup({ email, name, password }: CreateUserDto) {
    const existing = await this.usersService.findByEmail(email)

    if (!existing) {
      const user = await this.usersService.create({
        name,
        email,
        password: await this.usersService.hashPassword(password)
      })

      // Send a verification email
      await this.usersService.sendVerificationEmail(user.id, email)

      // Send a welcome email
      await this.emailService.sendTemplatedEmail('welcome-email', {}, [email])

      return {
        auth: await this.login(user),
        me: plainToClass(User, user)
      }
    } else {
      return AuthServiceError.Exists
    }
  }

  /**
   * Signs up a user and creates organisation, and immediately
   * creates tokens
   *
   * TODO: This should fail gracefully if a user already exists
   * (it will fail already with a 500 error due to unique email column)
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async signupWithOrganisation({
    email,
    name,
    password,
    agree_to_terms,
    subscribe,
    company,
    type,
    type_other,
    date
  }: CreateUserWithOrganisationDto) {
    const existing = await this.usersService.findByEmail(email)

    if (!existing) {
      const user = await this.usersService.create({
        name,
        email,
        password: await this.usersService.hashPassword(password)
      })

      // Send a verification email
      await this.usersService.sendVerificationEmail(user.id, email)

      // Send a welcome email
      await this.emailService.sendTemplatedEmail('welcome-email-admin', {}, [
        email
      ])

      // If the user chose to subscribe, add them to settings
      // Which invokes Intercom update
      if (subscribe) {
        await this.userSettingsService.update(user.id, {
          newsletter_subscriptions_admin: true,
          newsletter_subscriptions_user: true
        })
      }

      // Create the organisation
      // Also creates the default subscription and team
      // Also assigns the owner as an admin
      await this.organisationsService.signup(
        {
          name: company,
          type,
          type_other,
          timezone: '',
          mode: OrganisationMode.Simple,
          terms_agreed: agree_to_terms,
          terms_agreed_at: new Date()
        },
        user.id
      )

      return {
        auth: await this.login(user),
        me: plainToClass(User, user)
      }
    } else {
      return AuthServiceError.Exists
    }
  }

  /**
   * Signs up a user and creates organisation, and immediately
   * creates tokens
   *
   * TODO: This should fail gracefully if a user already exists
   * (it will fail already with a 500 error due to unique email column)
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async signupNewOrganisation(
    {
      name,
      agree_to_terms,
      subscribe,
      company,
      type,
      type_other,
      date
    }: CreateOrganisationAsUserDto,
    userId: string
  ) {
    const user = await this.usersService.findOne(userId)

    if (!agree_to_terms) {
      throw new BadRequestException('You must agree to terms to continue')
    }

    // Send a welcome email
    await this.emailService.sendTemplatedEmail('welcome-email-admin', {}, [
      user.email
    ])

    // If the user chose to subscribe, add them to settings
    // Which invokes Intercom update
    if (subscribe) {
      await this.userSettingsService.update(user.id, {
        newsletter_subscriptions_admin: true,
        newsletter_subscriptions_user: true
      })
    }

    // Create the organisation
    // Also creates the default subscription and team
    // Also assigns the owner as an admin
    const organisation = await this.organisationsService.signup(
      {
        name: company,
        type,
        type_other,
        timezone: '',
        mode: OrganisationMode.Simple,
        terms_agreed: agree_to_terms,
        terms_agreed_at: new Date()
      },
      user.id
    )

    return organisation
  }

  /**
   * Signs up a user and immediately
   * creates tokens
   *
   * TODO: This should fail gracefully if a user already exists
   * (it will fail already with a 500 error due to unique email column)
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async signupWithProvider(provider: Partial<AuthProvider>) {
    // The provider is not password-based, but we'll create a strong randomized
    // password here
    const randomizedPassword = Date.now() + uuid()

    const user = await this.usersService.createWithProvider(
      {
        name: provider.display_name,
        email: provider.email,
        password: await this.usersService.hashPassword(randomizedPassword)
      },
      provider
    )

    // Send a verification email
    await this.usersService.sendVerificationEmail(user.id, provider.email)

    // Send a welcome email
    await this.emailService.sendTemplatedEmail('welcome-email', {}, [
      provider.email
    ])

    return {
      auth: await this.login(user),
      me: plainToClass(User, user)
    }
  }

  /**
   * Associates an existing user with a new provider
   *
   * @param user
   * @returns object containing 3 tokens and user object
   */
  async associateWithProvider(user: User, provider: Partial<AuthProvider>) {
    await this.usersService.associateWithProvider(user, provider)

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
  async createAccessToken(user: User, roles?: JWTRoles) {
    const payload = {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      sub: user.id,
      iat: new Date().getTime(),
      roles: roles || (await this.usersService.getRolesForToken(user))
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
   * Sends user a password reset link in an email
   *
   * This is a deep link which on desktop will be
   * routed to the browser app at https://my.fitlinkapp.com
   *
   * On mobile, it will deep link into the app
   *
   * @param email
   * @returns
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (user) {
      const token = this.getResetPasswordToken(user)
      const link = this.configService
        .get('RESET_PASSWORD_URL')
        .replace('{token}', token)

      await this.emailService.sendTemplatedEmail(
        'password-reset',
        {
          PASSWORD_RESET_LINK: link
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
      const password = await this.usersService.hashPassword(
        resetPasswordDto.password
      )
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

  async findUserByProvider(provider: Partial<AuthProvider>) {
    const result = await this.authProviderRepository.findOne({
      where: {
        type: provider.type,
        email: provider.email,
        raw_id: provider.raw_id
      },
      relations: ['user', 'user.avatar']
    })

    if (result && result.user) {
      return result.user
    } else {
      return false
    }
  }

  /**
   * Retrieves or signs up a user based on token
   * @param param0
   * @returns
   */
  async connectWithAuthProvider({ provider, token, signup }: AuthConnectDto) {
    let result: Partial<AuthProvider>
    switch (provider) {
      case AuthProviderType.Google:
        result = await this.verifyProviderGoogle(token)
        break
      case AuthProviderType.Apple:
        result = await this.verifyProviderApple(token)
        break
      default:
        return { error: AuthServiceError.Provider }
    }

    if (!result.email) {
      return { error: AuthServiceError.Email }
    }

    // Search for a user
    let user = await this.findUserByProvider(result)
    if (!user) {
      user = await this.usersService.findByEmail(result.email, ['avatar'])

      // Associates the existing user with the new provider
      if (user) {
        if (signup) {
          return { error: AuthServiceError.Exists }
        }
        return {
          result: await this.associateWithProvider(user, result)
        }
      }
    }

    if (user) {
      if (signup) {
        return { error: AuthServiceError.Exists }
      }
      // Conditionally update the avatar
      const image = await this.usersService.updateAvatarFromProvider(
        user.id,
        result
      )
      if (image) {
        user.avatar = image
      }
      return {
        result: {
          auth: await this.login(user),
          me: plainToClass(User, user)
        }
      }
    } else {
      const signup = await this.signupWithProvider(result)
      return {
        result: signup
      }
    }
  }

  async verifyProviderGoogle(idToken: string): Promise<Partial<AuthProvider>> {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID')

    if (!clientId) {
      throw new InternalServerErrorException('Google not configured')
    }

    const googleAuthClient = new OAuth2Client(clientId)

    const ticket = await googleAuthClient.verifyIdToken({
      idToken: idToken,
      audience: clientId
    })

    const payload = ticket.getPayload()

    return {
      email: payload.email,
      display_name: payload.name,
      photo_url: payload.picture,
      raw_id: payload.sub,
      type: AuthProviderType.Google
    }
  }

  async verifyProviderApple(token: string): Promise<Partial<AuthProvider>> {
    const clientId = this.configService.get('APPLE_CLIENT_ID')
    const clientSecret = await this.generateClientSecret()

    if (!clientId) {
      throw new InternalServerErrorException('Apple not configured')
    }

    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('client_secret', clientSecret)
    params.append('grant_type', 'authorization_code')
    params.append('code', token)

    try {
      const result = await this.httpService
        .post('https://appleid.apple.com/auth/token', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .toPromise()

      const payload = this.jwtService.decode(result.data.id_token)

      return {
        email: payload['email'],
        raw_id: payload['sub'],
        type: AuthProviderType.Apple,
        display_name: payload['name']
      }
    } catch (e) {
      const { error, error_description } = e.response.data
      throw new InternalServerErrorException(error_description || error)
    }
  }

  async generateClientSecret() {
    const keyId = '667D87STU7'
    const teamId = '58US58KL26'
    const clientId = this.configService.get('APPLE_CLIENT_ID')
    const b64 = this.configService.get('APPLE_PRIVATE_KEY_B64')

    if (!clientId || !b64) {
      throw new InternalServerErrorException('Apple not configured')
    }

    const key = Buffer.from(b64, 'base64').toString('utf-8')

    const now = Math.floor(Date.now() / 1000)

    return this.jwtService.sign(
      {
        iss: teamId,
        iat: now,
        aud: 'https://appleid.apple.com',
        sub: clientId
      },
      {
        keyid: keyId,
        expiresIn: 86400 * 2,
        algorithm: 'ES256',
        // Note that secret is used, NOT privateKey
        secret: key
      }
    )
  }

  /**
   * Creates a new JWT for a user to have specific
   * access.
   *
   * @param userId
   * @param switchDto with role and id of targeted object to manage (e.g. a team)
   * @returns jwt
   */
  async switchSession(userId: string, { role, id }: AuthSwitchDto) {
    const user = await this.usersService.findOne(userId)
    const roles = await this.usersService.getRolesForToken(user)
    const base: JWTRoles = {
      o_a: [],
      s_a: [],
      t_a: [],
      spr: false
    }

    // Restore the user's original roles / session
    if (!role || role === Roles.Self) {
      return this.login(user)
    }

    if (role === Roles.SuperAdmin) {
      if (roles.spr) {
        return this.loginWithRole(user, {
          ...base,
          spr: true
        })
      }
    }

    if (role === Roles.OrganisationAdmin) {
      if (roles.o_a.includes(id)) {
        const organisation = await this.organisationsService.findOne(id)
        return this.loginWithRole(user, {
          ...base,
          o_a: [id],
          t_a: [organisation.teams[0].id],
          s_a: [organisation.subscriptions[0].id]
        })
      }
    }

    if (role === Roles.SubscriptionAdmin) {
      if (roles.s_a.includes(id)) {
        return this.loginWithRole(user, {
          ...base,
          s_a: [id]
        })
      }
    }

    // Organisation admin can switch to managing a specific team
    if (role === Roles.TeamAdmin) {
      const orgs = []
      const subs = []
      if (!roles.spr) {
        const team = await this.teamRepository.findOne(id, {
          relations: ['organisation', 'organisation.subscriptions']
        })

        // Organisation admins have full access to teams
        // as well as subscriptions (billing)
        if (roles.o_a.includes(team.organisation.id)) {
          orgs.push(team.organisation.id)
          subs.push(team.organisation.subscriptions[0].id)

          // Allow access for team admins
        } else if (!roles.t_a.includes(team.id)) {
          return false
        }
      }
      return this.loginWithRole(user, {
        ...base,
        t_a: [id],
        o_a: orgs,
        s_a: subs
      })
    }

    // Super admin can switch to managing a specific organisation
    if (roles.spr && role === Roles.OrganisationAdmin) {
      const organisation = await this.organisationsService.findOne(id)
      return this.loginWithRole(user, {
        ...base,
        o_a: [id],
        t_a: [organisation.teams[0].id],
        s_a: [organisation.subscriptions[0].id]
      })
    }
  }

  /**
   * Returns tokens for a particular user session
   * based on a switch session
   *
   * Used for the local guard/strategy
   *
   * @param user
   * @returns object containing 3 tokens
   */
  async loginWithRole(user: User, roles: JWTRoles): Promise<AuthResultDto> {
    const refreshToken = await this.createRefreshToken(user)

    return {
      access_token: await this.createAccessToken(user, roles),
      id_token: await this.createIdToken(user),
      refresh_token: refreshToken
    }
  }
}

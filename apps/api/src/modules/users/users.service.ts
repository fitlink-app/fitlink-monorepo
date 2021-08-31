import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { formatRoles } from '../../helpers/formatRoles'
import { Repository } from 'typeorm'
import { JWTRoles } from '../../models'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateBasicUserDto, UpdateUserDto } from './dto/update-user.dto'
import { User, UserPublic } from './entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { ImageType } from '../images/images.constants'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { plainToClass } from 'class-transformer'
import { JwtService } from '@nestjs/jwt'
import { EmailService } from '../common/email.service'
import { EmailResetJWT } from '../../models/email-reset.jwt.model'
import { ConfigService } from '@nestjs/config'
import { FirebaseScrypt } from './helpers/firebase-scrypt'
import { AuthProvider } from '../auth/entities/auth-provider.entity'
import { ImagesService } from '../images/images.service'
import { FilterUserDto } from './dto/search-user.dto'
import { Roles } from '../user-roles/user-roles.constants'

type EntityOwner = {
  organisationId?: string
  subscriptionId?: string
  teamId?: string
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthProvider)
    private authProviderRepository: Repository<AuthProvider>,
    private userRolesService: UserRolesService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private imageService: ImagesService
  ) {}

  async getRolesForToken(user: User): Promise<JWTRoles> {
    const roles = await this.userRolesService.getAllUserRoles(user.id)
    return formatRoles(roles)
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  /**
   * Creates a user along with its provider
   * Also attempts to set the avatar, usually provided by Google
   *
   * @param createUserDto
   * @param authProvider
   * @returns
   */
  async createWithProvider(
    createUserDto: CreateUserDto,
    authProvider: Partial<AuthProvider>
  ) {
    const user = await this.userRepository.manager.transaction(
      async (manager) => {
        const userRepository = manager.getRepository(User)
        const authProviderRepository = manager.getRepository(AuthProvider)
        const user = await userRepository.save(
          this.userRepository.create({
            ...createUserDto
          })
        )

        const provider = authProviderRepository.create(authProvider)
        provider.user = user

        await authProviderRepository.save(provider)

        return user
      }
    )

    // Attempt to attach photo_url as avatar
    if (authProvider.photo_url) {
      const image = await this.imageService.createProxy(
        authProvider.photo_url,
        {
          type: ImageType.Avatar
        }
      )

      // Set the avatar
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'avatar')
        .of(user)
        .set(image)

      user.avatar = image
    }

    return user
  }

  /**
   * Associates an existing user with a provider
   *
   * @param user
   * @param authProvider
   * @returns
   */
  async associateWithProvider(user: User, authProvider: Partial<AuthProvider>) {
    const provider = this.authProviderRepository.create(authProvider)
    provider.user = user

    const result = await this.authProviderRepository.save(provider)

    // Update the associated profile image if it exists
    await this.updateAvatarFromProvider(user.id, authProvider)

    return result
  }

  /**
   * Updates an existing user with the provider's avatar
   * @param userId
   * @param authProvider
   * @returns
   */
  async updateAvatarFromProvider(
    userId: string,
    authProvider: Partial<AuthProvider>
  ) {
    // Attempt to attach photo_url as avatar
    if (authProvider.photo_url) {
      const userWithAvatar = await this.userRepository.findOne(userId, {
        relations: ['avatar']
      })

      // If the avatar hasn't changed, ignore this.
      if (
        userWithAvatar.avatar &&
        userWithAvatar.avatar.url === authProvider.photo_url
      ) {
        return false
      }

      const image = await this.imageService.createProxy(
        authProvider.photo_url,
        {
          type: ImageType.Avatar,
          id: userWithAvatar.avatar ? userWithAvatar.avatar.id : undefined,
          alt: userWithAvatar.name
        }
      )

      // Set the avatar if it's not already set
      if (!userWithAvatar.avatar) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'avatar')
          .of(userId)
          .set(image)
      }

      return image
    }

    return false
  }

  async findAllUsers(
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    filters: FilterUserDto = {},
    entityOwner?: EntityOwner
  ): Promise<Pagination<User>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'settings')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .take(limit)
      .skip(page * limit)

    if (entityOwner && entityOwner.organisationId) {
      query = query
        .innerJoin('user.teams', 'team')
        .innerJoin('team.organisation', 'organisation')
        .where('organisation.id = :organisationId', {
          organisationId: entityOwner.organisationId
        })
    }

    if (entityOwner && entityOwner.teamId) {
      query = query
        .innerJoin('user.teams', 'team')
        .innerJoin('team.organisation', 'organisation')
        .where('team.id = :teamId', {
          teamId: entityOwner.teamId
        })
    }

    const where = entityOwner ? 'andWhere' : 'where'
    if (filters.q && filters.q.indexOf('@') > 0) {
      query = query[where]('user.email ILIKE :email', {
        email: `${filters.q}%`
      })
    } else if (filters.q) {
      query = query[where]('user.name ILIKE :name', {
        name: `%${filters.q}%`
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<User>({
      results,
      total
    })
  }

  /**
   * Finds all admins based on role
   * @param param0
   * @param filters
   * @param entityOwner
   * @returns
   */

  async findAllAdmins(
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    filters: FilterUserDto = {},
    entityOwner?: EntityOwner
  ): Promise<Pagination<User>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .innerJoin('user.roles', 'role')
      .take(limit)
      .skip(page * limit)

    if (entityOwner && entityOwner.organisationId) {
      query = query.where('role.organisation.id = :organisationId', {
        organisationId: entityOwner.organisationId
      })

      if (entityOwner.subscriptionId) {
        query = query
          .andWhere('role.role = :role', {
            role: Roles.SubscriptionAdmin
          })
          .andWhere('role.subscription.id = :subscriptionId', {
            subscriptionId: entityOwner.subscriptionId
          })
      } else {
        query = query.andWhere('role.role = :role', {
          role: Roles.OrganisationAdmin
        })
      }
    } else if (entityOwner && entityOwner.subscriptionId) {
      query = query.where('role.subscription.id = :subscriptionId', {
        subscriptionId: entityOwner.organisationId
      })
    }

    if (entityOwner && entityOwner.teamId) {
      query = query
        .where('role.team.id = :teamId', {
          teamId: entityOwner.teamId
        })
        .andWhere('role.role = :role', {
          role: Roles.TeamAdmin
        })
    }

    if (
      !entityOwner.organisationId &&
      !entityOwner.teamId &&
      !entityOwner.subscriptionId
    ) {
      query = query.where('role.role = :role', {
        role: Roles.SuperAdmin
      })
    }

    if (filters.q && filters.q.indexOf('@') > 0) {
      query = query.andWhere('user.email ILIKE :email', {
        email: `${filters.q}%`
      })
    } else if (filters.q) {
      query = query.andWhere('user.name ILIKE :name', {
        name: `%${filters.q}%`
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<User>({
      results,
      total
    })
  }

  async searchByNameOrEmail(
    keyword: string,
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.following', 'f1', 'f1.follower.id = :userId', {
        userId
      })
      .leftJoinAndSelect('user.followers', 'f2', 'f2.following.id = :userId', {
        userId
      })
      .take(limit)
      .skip(page * limit)

    // Precision search by email
    if (keyword.indexOf('@') > 0) {
      query = query.where('email = :keyword', { keyword })
    } else if (keyword) {
      query = query.where('name ILIKE :keyword AND user.id != :userId', {
        keyword: `%${keyword}%`,
        userId
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: results.map(this.getUserPublic),
      total
    })
  }

  async findByEmail(email: string, relations: string[] = []) {
    const user = await this.userRepository.findOne({
      where: {
        email
      },
      relations
    })
    return user
  }

  /**
   * Formats the user entity as UserPublic
   * to prevent leaked sensitive data.
   *
   * @param user
   * @returns UserPublic
   */
  getUserPublic(user: User) {
    const userPublic = (user as unknown) as UserPublic

    /**
     * NOTE: in this scenario, following is used to determine
     * if the authenticated user is following the given user entity.
     */
    userPublic.following = Boolean(user.following && user.following.length)

    /**
     * NOTE: in this scenario, follower is used to determine
     * if the authenticated user is being followed by the
     * given user entity.
     */
    userPublic.follower = Boolean(user.followers && user.followers.length)
    return plainToClass(UserPublic, userPublic, {
      excludeExtraneousValues: true
    })
  }

  /**
   * Finds a user
   * @param id
   * @param options
   * @returns
   */
  findOne(id: string) {
    return this.userRepository.findOne(id, {
      relations: ['settings', 'avatar']
    })
  }

  /**
   * Finds a user for a particular viewer user
   * which provides following/follower booleans
   *
   * @param userId The user to lookup
   * @param viewerId The user that is viewing (typically authenticated user)
   * @returns User
   */
  findForViewer(userId: string, viewerId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'settings')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('user.following', 'f1', 'f1.follower.id = :viewerId', {
        viewerId
      })
      .leftJoinAndSelect(
        'user.followers',
        'f2',
        'f2.following.id = :viewerId',
        { viewerId }
      )
      .where('user.id = :userId', { userId })
      .getOne()
  }

  /**
   * Finds the public user
   * @param id
   * @returns public user
   */
  async findPublic(userId: string, viewerId: string) {
    const user = await this.findForViewer(userId, viewerId)
    return this.getUserPublic(user)
  }

  update(id: string, update: UpdateUserDto) {
    return this.userRepository.update(id, update)
  }

  updateBasic(id: string, { imageId, ...rest }: UpdateBasicUserDto) {
    let update: Partial<User> = { ...rest }

    if (imageId) {
      update.avatar = new Image()
      update.avatar.id = imageId

      // Explict removal of image
    } else if (imageId === null) {
      update.avatar = null
    }

    return this.userRepository.update(id, update)
  }

  updateEntity(id: string, entity: Partial<User>) {
    return this.userRepository.update(id, entity)
  }

  async verifyAndUpdatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await this.userRepository.findOne(userId)

    if (await this.verifyPassword(oldPassword, user.password)) {
      const hashedPassword = await this.hashPassword(newPassword)
      return this.userRepository.update(userId, {
        password: hashedPassword,
        password_reset_at: new Date()
      })
    } else {
      return false
    }
  }

  updatePassword(id: string, hashedPassword: string) {
    return this.userRepository.update(id, {
      password: hashedPassword,
      password_reset_at: new Date()
    })
  }

  updateAvatar(id: string, imageId: string) {
    const avatar = new Image()
    avatar.id = imageId
    return this.userRepository.update(id, {
      avatar
    })
  }

  /**
   * Ensures the requested email is not yet in use
   * or pending for another account, then triggers
   * email update request flow.
   *
   * This endpoint can be used for "resend email" as well,
   * since it does not check whether the email is in use
   * for the authenticated user.
   *
   * @param userId
   * @param email
   * @returns
   */
  async updateEmail(userId: string, email: string) {
    const exists = await this.userRepository
      .createQueryBuilder()
      .where('(email = :email OR email_pending = :email)', { email })
      .andWhere('id != :userId', { userId })
      .getCount()

    if (exists) {
      throw new Error('Requested email is already in use')
    }

    await this.sendVerificationEmail(userId, email)

    return this.userRepository.update(userId, {
      email_pending: email,

      // This could later be used to prevent spammy behaviour
      email_reset_requested_at: new Date()
    })
  }

  /**
   * Verifies an email address. The user's ID and email is contained
   * within the JWT payload
   *
   * @param token
   * @returns
   */
  verifyEmail(token: string) {
    try {
      const payload = this.jwtService.decode(token) as EmailResetJWT
      this.jwtService.verify(token)
      if (payload.type === 'email-reset') {
        const [id, email] = payload.sub.split('|')
        return this.userRepository.update(id, {
          email,
          email_verified: true,
          email_reset_at: new Date(),
          email_pending: null
        })
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  /**
   * Sends a JWT-based email verification link to the email address
   * @param id
   * @param email
   * @returns
   */
  sendVerificationEmail(id: string, email: string) {
    const payload: EmailResetJWT = {
      iss: 'fitlinkapp.com',
      aud: 'fitlinkapp.com',
      iat: new Date().getTime(),
      sub: id + '|' + email,
      type: 'email-reset'
    }

    const token = this.jwtService.sign(payload)
    const EMAIL_VERIFICATION_LINK = this.configService
      .get('EMAIL_VERIFICATION_URL')
      .replace('{token}', token)

    return this.emailService.sendTemplatedEmail(
      'email-verification',
      { EMAIL_VERIFICATION_LINK },
      [email]
    )
  }

  updateFollowerCount(userId: string, count: number) {
    return this.userRepository.update(userId, {
      followers_total: count
    })
  }

  deleteAvatar(id: string) {
    return this.userRepository.update(id, {
      avatar: null
    })
  }

  // TODO: User removal is more complex
  // and requires that their relationships are
  // destroyed first in order. This will require a transaction.
  remove(id: string) {
    return this.userRepository.delete(id)
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
   * hash_config {
      algorithm: SCRYPT,
      base64_signer_key: jdxuhzY2965aDqZSZffPwjd397Mm2oEmkyAm2TQlIy3bJqwFRLlOsc1yzboGqSMSRisHV3LPmXQ3gGnX/3iZ1g==,
      base64_salt_separator: Bw==,
      rounds: 8,
      mem_cost: 14,
    }
   *
   *
   *
   *
   * @param password
   * @param hash
   * @returns
   */

  async verifyFirebasePassword(password: string, hash: string) {
    const scrypt = new FirebaseScrypt({
      memCost: 14,
      rounds: 8,
      saltSeparator: 'Bw==',
      signerKey:
        'jdxuhzY2965aDqZSZffPwjd397Mm2oEmkyAm2TQlIy3bJqwFRLlOsc1yzboGqSMSRisHV3LPmXQ3gGnX/3iZ1g=='
    })

    const [hashed, salt] = hash.split('__FIREBASE__')

    return scrypt.verify(password, salt, hashed)
  }
}

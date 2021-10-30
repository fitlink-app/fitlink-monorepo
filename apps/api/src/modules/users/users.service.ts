import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { formatRoles } from '../../helpers/formatRoles'
import { Repository, Brackets } from 'typeorm'
import { JWTRoles } from '../../models'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateBasicUserDto, UpdateUserDto } from './dto/update-user.dto'
import { User, UserPublic } from './entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { ImageType } from '../images/images.constants'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { EmailService } from '../common/email.service'
import { EmailResetJWT } from '../../models/email-reset.jwt.model'
import { ConfigService } from '@nestjs/config'
import { FirebaseScrypt } from './helpers/firebase-scrypt'
import { AuthProvider } from '../auth/entities/auth-provider.entity'
import { ImagesService } from '../images/images.service'
import { FilterUserDto } from './dto/search-user.dto'
import { UserRank } from './users.constants'
import { Roles } from '../user-roles/user-roles.constants'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import {
  subDays,
  differenceInMilliseconds,
  startOfWeek,
  isMonday
} from 'date-fns'
import { CommonService } from '../common/services/common.service'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationAction } from '../notifications/notifications.constants'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { League } from '../leagues/entities/league.entity'
import { LeaguesInvitation } from '../leagues-invitations/entities/leagues-invitation.entity'
import { RewardsRedemption } from '../rewards-redemptions/entities/rewards-redemption.entity'
import { Following } from '../followings/entities/following.entity'
import { FeedItem } from '../feed-items/entities/feed-item.entity'
import { FeedItemLike } from '../feed-items/entities/feed-item-like.entity'
import { GoalsEntry } from '../goals-entries/entities/goals-entry.entity'
import { Notification } from '../notifications/entities/notification.entity'
import { UserRole } from '../user-roles/entities/user-role.entity'
import { Provider } from '../providers/entities/provider.entity'
import { Activity } from '../activities/entities/activity.entity'
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity'
import { HealthActivityDebug } from '../health-activities/entities/health-activity-debug.entity'
import { zonedStartOfDay } from '../../../../common/date/helpers'
import { addHours } from 'date-fns'
import { DeepLinkType } from '../../constants/deep-links'
import { GoalsEntriesService } from '../goals-entries/goals-entries.service'
import { RefreshToken } from '../auth/entities/auth.entity'

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
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private userRolesService: UserRolesService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private imageService: ImagesService,
    private commonService: CommonService,
    private notificationsService: NotificationsService,
    private goalsService: GoalsEntriesService
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
      .leftJoinAndSelect('user.providers', 'providers')
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
      results: results.map((result) => ({
        ...result,
        providers: result.providers.map((p) => ({
          id: p.id,
          type: p.type
        }))
      })),
      total
    })
  }

  async findUserDetail(userId: string, teamId: string) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['teams', 'leagues', 'rewards_redemptions']
    })

    // If the user does not exist or is missing from this team.
    if (!user || user.teams.filter((team) => team.id === teamId).length === 0) {
      return false
    }

    const activity = await this.userRepository.manager
      .getRepository(HealthActivity)
      .findOne({
        where: {
          user: { id: userId }
        },
        order: {
          created_at: 'DESC'
        },
        relations: ['sport']
      })

    return {
      user,
      activity
    }
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
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('user.following', 'f1', 'f1.follower.id = :userId', {
        userId
      })
      .leftJoinAndSelect('user.followers', 'f2', 'f2.following.id = :userId', {
        userId
      })
      .leftJoinAndSelect('user.leagues', 'leagues')
      .leftJoinAndSelect('user.teams', 'teams')
      .take(limit)
      .skip(page * limit)

    // Precision search by email
    if (keyword.indexOf('@') > 0) {
      query = query.where('user.email = :keyword', { keyword })
    } else if (keyword) {
      query = query.where('user.name ILIKE :keyword AND user.id != :userId', {
        keyword: `%${keyword}%`,
        userId
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: this.commonService.mapUserPublic(results),
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
   * Store only unique FCM tokens
   * @param userId
   * @param tokens
   * @returns
   */
  async mergeFcmTokens(userId: string, token: string) {
    const user = await this.userRepository.findOne(userId)
    const tokens = user.fcm_tokens || []
    const fcm_tokens = [...new Set(tokens.concat([token]))]
    return this.userRepository.update(userId, {
      fcm_tokens,
      last_app_opened_at: new Date()
    })
  }

  /**
   * Remove a particular token from the array
   * (e.g. on logout)
   * @param userId
   * @param tokens
   * @returns
   */
  async removeFcmToken(userId: string, token: string) {
    const user = await this.userRepository.findOne(userId)
    const tokens = user.fcm_tokens || []
    const fcm_tokens = tokens.filter((t) => t !== token)
    await this.userRepository.update(userId, {
      fcm_tokens
    })

    return {
      removed: tokens.length - fcm_tokens.length
    }
  }

  /**
   * Finds a user
   * @param id
   * @param options
   * @returns
   */
  async findOne(id: string) {
    return this.userRepository.findOne(id, {
      relations: ['settings', 'avatar', 'teams']
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
    return this.commonService.getUserPublic(user)
  }

  async update(id: string, payload: UpdateUserDto) {
    const update: Partial<User> = { ...payload }
    if (update.onboarded) {
      update.last_onboarded_at = new Date()
    }

    const result = await this.userRepository.update(id, update)
    await this.goalsService.updateTargets(id)
    return result
  }

  ping(id: string) {
    return this.userRepository.update(id, {
      last_app_opened_at: new Date()
    })
  }

  updateBasic(id: string, { imageId, ...rest }: UpdateBasicUserDto) {
    const update: Partial<User> = { ...rest }

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
      // Revoke all refresh tokens
      await this.refreshTokenRepository.update(
        {
          user: {
            id: userId
          },
          revoked: false
        },
        {
          revoked: true,
          revoked_at: new Date()
        }
      )
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
      throw new BadRequestException('Requested email is already in use')
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
      this.jwtService.verify(token, {
        secret: this.configService.get('EMAIL_JWT_TOKEN_SECRET')
      })

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

  generatePostEmailVerifyLink() {
    return this.commonService.generateDynamicLink(
      DeepLinkType.EmailVerification,
      {},
      this.configService.get('DASHBOARD_URL') + '/login'
    )
  }

  /**
   * Sends a JWT-based email verification link to the email address.
   *
   * This is a deep link which on desktop will be
   * routed to the browser app at https://my.fitlinkapp.com
   *
   * On mobile, it will deep link into the app
   *
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

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('EMAIL_JWT_TOKEN_SECRET')
    })

    const link = this.configService
      .get('EMAIL_VERIFICATION_URL')
      .replace('{token}', token)

    return this.emailService.sendTemplatedEmail(
      'email-verification',
      { EMAIL_VERIFICATION_LINK: link },
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

  async calculateUserRank(userId: string) {
    const user = await this.userRepository.findOne(userId)
    return this.calculateUserRankFromMinutes(user.active_minutes_week)
  }

  calculateUserRankFromMinutes(minutes: number) {
    const average = Math.ceil(minutes / 7)
    return isNaN(average) || !average || average <= 10
      ? UserRank.Tier1
      : average <= 30
      ? UserRank.Tier2
      : average <= 50
      ? UserRank.Tier3
      : UserRank.Tier4
  }

  /**
   * We only care about changing ranks
   * on users that have been active in the last
   * 8 days. If they haven't been active, their rank
   * will have already dropped to the lowest.
   *
   * TODO: This doesn't yet take into account the user's
   * timezone.
   */
  async processPendingRankDrops() {
    const started = new Date()

    const Tier2Minutes = 10 * 7
    const Tier3Minutes = 30 * 7
    const Tier4Minutes = 50 * 7

    const usersToDropRank = await this.userRepository
      .createQueryBuilder('user')
      // .where("user.last_health_activity_at >= :prev", { prev: subDays(new Date(), 8) })
      .where('week_reset_at < :start', { start: startOfWeek(new Date()) })
      .andWhere('user.rank != :tier1', { tier1: UserRank.Tier1 })
      .andWhere(
        new Brackets((qb) => {
          return qb
            .where(
              'user.rank = :tier2 AND user.active_minutes_week < :tier2minutes',
              {
                tier2: UserRank.Tier2,
                tier2minutes: Tier2Minutes
              }
            )
            .orWhere(
              'user.rank = :tier3 AND user.active_minutes_week < :tier3minutes',
              {
                tier3: UserRank.Tier3,
                tier3minutes: Tier3Minutes
              }
            )
            .orWhere(
              'user.rank = :tier4 AND user.active_minutes_week < :tier4minutes',
              {
                tier4: UserRank.Tier4,
                tier4minutes: Tier4Minutes
              }
            )
        })
      )
      .getMany()

    const { updated, users } = await this.userRepository.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(User)
        const users = await Promise.all(
          usersToDropRank.map(async (user) => {
            const rank = this.calculateUserRankFromMinutes(
              user.active_minutes_week
            )
            await repo.update(user.id, { rank })
            return { user, rank }
          })
        )

        const updated = await manager
          .createQueryBuilder()
          .update(User)
          .set({
            active_minutes_week: 0,
            week_reset_at: new Date()
          })
          .execute()

        return {
          updated,
          users
        }
      }
    )

    const messages = await Promise.all(
      users.map((withRank) => {
        return this.notificationsService.sendAction(
          [withRank.user],
          NotificationAction.RankDown,
          {
            subject: withRank.rank
          }
        )
      })
    )

    await this.commonService.notifySlackJobs(
      'Rank drop',
      {
        dropped: usersToDropRank.length,
        updated,
        messages: messages
      },
      differenceInMilliseconds(started, new Date())
    )

    return {
      count: usersToDropRank.length
    }
  }

  /**
   * For users that haven't exercised in more than
   * 4 days we push a notification on Mondays.
   */
  async processMondayMorningReminder() {
    const now = new Date()

    // Ensure this only ever runs on Monday
    if (!isMonday(now)) {
      return false
    }

    const started = new Date()
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(
        'last_lifestyle_activity_at IS NULL OR last_lifestyle_activity_at < :prev',
        { prev: subDays(new Date(), 4) }
      )
      .andWhere('onboarded = true')
      .getMany()

    const eligible = users.filter((e) => {
      // Notify users between 7am - 9am.
      const am7 = addHours(zonedStartOfDay(e.timezone, now), 7)
      const am9 = addHours(zonedStartOfDay(e.timezone, now), 9)
      return now >= am7 && now < am9 && e.fcm_tokens && e.fcm_tokens.length
    })

    const messages = await this.notificationsService.sendAction(
      eligible,
      NotificationAction.MondayReminder
    )

    await this.commonService.notifySlackJobs(
      'Monday morning update',
      {
        notified_total: eligible.length,
        messages: messages
      },
      differenceInMilliseconds(started, new Date())
    )

    return {
      total: eligible.length,
      messages
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne(id, {
      relations: ['roles']
    })

    if (!user) {
      return false
    }

    return this.userRepository.manager.transaction(async (manager) => {
      // Remove feed items
      await manager.getRepository(FeedItemLike).delete({
        user: { id }
      }),
        // Remove associated feed items
        await manager.getRepository(FeedItem).delete({
          related_user: { id }
        }),
        // Remove feed items
        await manager.getRepository(FeedItem).delete({
          user: { id }
        }),
        // Remove notifications
        await manager.getRepository(Notification).delete({
          user: { id }
        }),
        // Remove any associated roles
        await manager.getRepository(UserRole).delete({
          user: { id }
        })

      // Remove any associated auth providers (Google, Apple)
      await manager.getRepository(AuthProvider).delete({
        user: { id }
      })

      await manager.getRepository(RefreshToken).delete({
        user: { id }
      })

      await manager.getRepository(HealthActivityDebug).delete({
        user: { id }
      })

      await manager.getRepository(HealthActivity).delete({
        user: { id }
      })

      await manager.getRepository(GoalsEntry).delete({
        user: { id }
      })

      // Remove any associated providers (Strava, Fitbit, etc.)
      await manager.getRepository(Provider).delete({
        user: { id }
      })

      // Remove leaderboard entries
      await manager.getRepository(LeaderboardEntry).delete({
        user: { id }
      })

      // Remove league users
      await manager
        .getRepository(League)
        .createQueryBuilder()
        .relation(League, 'users')
        .of(League)
        .remove(id)

      await Promise.all([
        // Remove leagues invitations
        manager.getRepository(LeaguesInvitation).delete({
          to_user: { id }
        }),

        manager.getRepository(LeaguesInvitation).delete({
          from_user: { id }
        }),

        // Remove teams invitations
        manager.getRepository(TeamsInvitation).delete({
          owner: { id }
        }),

        manager.getRepository(TeamsInvitation).delete({
          resolved_user: { id }
        }),

        // Remove rewards redemptions
        manager.getRepository(RewardsRedemption).delete({
          user: { id }
        })
      ])

      await Promise.all([
        // Remove followings
        manager.getRepository(Following).delete({
          following: { id }
        }),

        // Remove followings
        manager.getRepository(Following).delete({
          follower: { id }
        })
      ])

      await manager.getRepository(League).update(
        {
          owner: { id }
        },
        {
          owner: null
        }
      )

      await manager.getRepository(Activity).update(
        {
          owner: { id }
        },
        {
          owner: null
        }
      )

      await manager.getRepository(Image).update(
        {
          owner: { id }
        },
        {
          owner: null
        }
      )

      // Finally, delete the user with cascades (for user settings)
      await manager.getRepository(User).remove(user)

      return true
    })
  }
}

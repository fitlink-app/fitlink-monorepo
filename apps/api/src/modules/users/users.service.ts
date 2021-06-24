import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { formatRoles } from '../../helpers/formatRoles'
import { ILike, Repository } from 'typeorm'
import { JWTRoles } from '../../models'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserPublic } from './entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { plainToClass } from 'class-transformer'
import { JwtService } from '@nestjs/jwt'
import { EmailService } from '../common/email.service'
import { EmailResetJWT } from '../../models/email-reset.jwt.model'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userRolesService: UserRolesService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  async getRolesForToken(user: User): Promise<JWTRoles> {
    const roles = await this.userRolesService.getAllUserRoles(user.id)
    return formatRoles(roles)
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  async findAllUsers({
    limit = 10,
    page = 0
  }: PaginationOptionsInterface): Promise<Pagination<User>> {
    const [results, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: page * limit,
      relations: ['settings']
    })
    return new Pagination<User>({
      results,
      total
    })
  }

  async searchByName(
    keyword: string,
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.following', 'f1', 'f1.follower.id = :userId', {
        userId
      })
      .leftJoinAndSelect('user.followers', 'f2', 'f2.following.id = :userId', {
        userId
      })
      .take(limit)
      .skip(page * limit)
      .where('name ILIKE :keyword AND user.id != :userId', {
        keyword: `%${keyword}%`,
        userId
      })

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: results.map(this.getUserPublic),
      total
    })
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    })
    return user
  }

  getUserPublic(user: User) {
    const userPublic = (user as unknown) as UserPublic

    userPublic.following = Boolean(
      user.following && user.following.length === 1
    )
    userPublic.follower = Boolean(user.followers && user.followers.length === 1)

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
   * Searches for a user and returns its interface
   * @param id
   * @returns public user
   */
  async findPublic(id: string) {
    const user = await this.findOne(id)
    return this.getUserPublic(user)
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto)
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
}

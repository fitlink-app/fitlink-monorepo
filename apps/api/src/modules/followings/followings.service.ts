import { Injectable, BadRequestException } from '@nestjs/common'
import { CreateFollowingDto } from './dto/create-following.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Following } from './entities/following.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { User, UserPublic } from '../users/entities/user.entity'
import { plainToClass } from 'class-transformer'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { NewFollowerEvent } from '../users/events/new-follower.event'

@Injectable()
export class FollowingsService {
  constructor(
    @InjectRepository(Following)
    private followingRepository: Repository<Following>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Creates following entity
   * @param userId
   * @param createFollowingDto
   */
  async create(
    userId: string,
    createFollowingDto: CreateFollowingDto
  ): Promise<UserPublic> {
    if (createFollowingDto.targetId === userId) {
      throw new BadRequestException('user and target id should be different')
    }

    const userFollowed = new User()
    userFollowed.id = createFollowingDto.targetId

    const me = new User()
    me.id = userId

    const following = new Following()
    following.following = userFollowed
    following.follower = me

    const result = await this.followingRepository.findOne(following)

    const saved = await this.followingRepository.save({
      ...result,
      ...following
    })

    const event = new NewFollowerEvent()
    event.userId = userId
    event.targetId = createFollowingDto.targetId
    await this.eventEmitter.emitAsync('user.new_follower', event)

    return plainToClass(UserPublic, saved.following, {
      excludeExtraneousValues: true
    })
  }

  /**
   * Find all followings by user (followerId), with pagination options
   * @param userId
   * @param options
   */
  async findAllFollowingOld(
    userId: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<UserPublic>> {
    const me = new User()
    me.id = userId

    const [results, total] = await this.followingRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following'],
      take: options.limit,
      skip: options.page * options.limit
    })

    return new Pagination<UserPublic>({
      results: results.map((each) =>
        plainToClass(UserPublic, each.following, {
          excludeExtraneousValues: true
        })
      ),
      total
    })
  }

  /**
   * Find all following by user (followerId), with pagination options
   * @param userId
   * @param options
   */
  async findAllFollowing(
    userId: string,
    { page, limit }: PaginationOptionsInterface
  ): Promise<Pagination<UserPublic>> {
    const me = new User()
    me.id = userId

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')

      // Look for any users that this user is following
      // Use an inner join, since results must only include following
      .innerJoinAndSelect(
        'user.following',
        'following',
        'following.follower.id = :userId',
        { userId }
      )

      // Look for any users that are following this user
      // Use a left join to prevent nullish results being excluded
      .leftJoinAndSelect(
        'user.followers',
        'followers',
        'followers.following.id = :userId',
        { userId }
      )

      .take(limit)
      .skip(page * limit)

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: results.map(this.getFollowersPublic),
      total
    })
  }

  /**
   * Find all followers by user (followingId), with pagination options
   * @param userId
   * @param options
   */
  async findAllFollowers(
    userId: string,
    { page, limit }: PaginationOptionsInterface
  ): Promise<Pagination<UserPublic>> {
    const me = new User()
    me.id = userId

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')

      // Look for any users that are following this user
      // Use an inner join, since results must only include followers
      .innerJoinAndSelect(
        'user.followers',
        'followers',
        'followers.following.id = :userId',
        { userId }
      )

      // Look for any users that are followed by this user
      // Use a left join to prevent nullish results being excluded
      .leftJoinAndSelect(
        'user.following',
        'following',
        'following.follower.id = :userId',
        { userId }
      )

      .take(limit)
      .skip(page * limit)

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: results.map(this.getFollowersPublic),
      total
    })
  }

  getFollowersPublic(user: User) {
    const userPublic = (user as unknown) as UserPublic
    userPublic.following = Boolean(user.following.length)
    userPublic.follower = Boolean(user.followers.length)
    return plainToClass(UserPublic, userPublic, {
      excludeExtraneousValues: true
    })
  }

  /**
   * Find a specific following entry
   */
  async findOne(following) {
    return await this.followingRepository.findOne(following)
  }

  /**
   * Deletes the following
   * Note that the following must first be found
   * since it needs to trigger subscribers on remove
   *
   * Subscribers won't be able to listen properly for deletion
   * events.
   *
   * @param userId
   * @param targetId
   */
  async remove(userId: string, targetId: string) {
    const following = await this.followingRepository.find({
      // The follower is the userId
      follower: { id: userId },

      // The user being followed is the targetId
      following: { id: targetId }
    })

    return await this.followingRepository.remove(following)
  }

  getFollowerCount(userBeingFollowedId: string) {
    return this.followingRepository.count({
      where: {
        following: {
          id: userBeingFollowedId
        }
      }
    })
  }
}

import { Injectable, BadRequestException } from '@nestjs/common'
import { CreateFollowingDto } from './dto/create-following.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Following } from './entities/following.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { User, UserPublic } from '../users/entities/user.entity'
import { plainToClass } from 'class-transformer'

@Injectable()
export class FollowingsService {
  constructor(
    @InjectRepository(Following)
    private followingRepository: Repository<Following>,
    @InjectRepository(User)
    private userRepository: Repository<User>
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

    const userToFollow = new User()
    userToFollow.id = createFollowingDto.targetId

    const me = new User()
    me.id = userId

    const following = new Following()
    following.following = userToFollow
    following.follower = me

    const result = await this.followingRepository.findOne(following)

    const saved = await this.followingRepository.save({
      ...result,
      ...following
    })

    return plainToClass(UserPublic, saved.following, {
      excludeExtraneousValues: true
    })
  }

  /**
   * Find all followings by user (followerId), with pagination options
   * @param userId
   * @param options
   */
  async findAllFollowing(
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
      .leftJoinAndSelect('user.followers', 'f1', 'f1.following.id = :userId', {
        userId
      })
      .leftJoinAndSelect(
        'user.following',
        'f2',
        'f2.follower.id = f1.follower.id'
      )
      .take(limit)
      .skip(page * limit)
      .where('f1.following.id = :userId', { userId })

    const [results, total] = await query.getManyAndCount()

    // const [results, total] = await this.followingRepository.findAndCount({
    //   where: { following: { id: userId } },
    //   relations: ['following'],
    //   take: limit,
    //   skip: page * limit
    // })

    return new Pagination<UserPublic>({
      results: results.map(this.getFollowersPublic),
      total
    })
  }

  getFollowersPublic(user: User) {
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
   * Find a specific following entry
   */
  async findOne(following) {
    return await this.followingRepository.findOne(following)
  }

  /**
   * Deletes the following
   * @param userId
   * @param targetId
   */
  async remove(userId: string, targetId: string) {
    const userToFollow = new User()
    userToFollow.id = targetId

    const me = new User()
    me.id = userId

    const following = new Following()
    following.following = userToFollow
    following.follower = me

    return await this.followingRepository.delete(following)
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

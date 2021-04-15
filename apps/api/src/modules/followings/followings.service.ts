import { Injectable, BadRequestException } from '@nestjs/common'
import { CreateFollowingDto } from './dto/create-following.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Following } from './entities/following.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { User } from '../users/entities/user.entity'

@Injectable()
export class FollowingsService {
  constructor(
    @InjectRepository(Following)
    private followingRepository: Repository<Following>
  ) {}

  /**
   * Creates following entity
   * @param userId
   * @param createFollowingDto
   */
  async create(
    userId: string,
    createFollowingDto: CreateFollowingDto
  ): Promise<Following> {
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

    return await this.followingRepository.save({
      ...result,
      ...following
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
  ): Promise<Pagination<Following>> {
    const me = new User()
    me.id = userId

    const [results, total] = await this.followingRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following'],
      take: options.limit,
      skip: options.page * options.limit
    })

    return new Pagination<Following>({
      results,
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
    options: PaginationOptionsInterface
  ): Promise<Pagination<Following>> {
    const me = new User()
    me.id = userId

    const [results, total] = await this.followingRepository.findAndCount({
      where: { following: { id: userId } },
      relations: ['following'],
      take: options.limit,
      skip: options.page * options.limit
    })

    return new Pagination<Following>({
      results,
      total
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
}

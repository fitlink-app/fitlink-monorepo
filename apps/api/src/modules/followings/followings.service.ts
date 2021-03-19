
import { Injectable } from '@nestjs/common'
import { CreateFollowingDto } from './dto/create-following.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Following } from './entities/following.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'

@Injectable()
export class FollowingsService {
  constructor(
    @InjectRepository(Following)
    private followingRepository: Repository<Following>
  ) {}

  /**
   * Creates following if it doesn't exist yet,
   * or alternatively updates it.
   * @param createFollowingDto
   */
    async create(createFollowingDto: CreateFollowingDto
      ): Promise<Following> {
      const { followerId, followingId } = createFollowingDto

      const result = await this.followingRepository.findOne({
        where: {
          followerId,
          followingId
        }
      })

      return await this.followingRepository.save({
        ...result,
        ...createFollowingDto,
        created_at: new Date(),
        updated_at: new Date()
      })
    }

  /**
   * Find all followings by user (followerId), with pagination options
   * @param followerId
   * @param options
   */
    async findAllFollowing(
      followerId: string,
      options: PaginationOptionsInterface
      ): Promise<Pagination<Following>> {
      const [results, total] = await this.followingRepository.findAndCount(
        {
          where: { followerId: followerId },
          take: options.limit,
          skip: options.page
        }
      )

      return new Pagination<Following>({
        results,
        total
      })
    }

  /**
   * Find all followers by user (followingId), with pagination options
   * @param followingId
   * @param options
   */
     async findAllFollowers(
      followingId: string,
      options: PaginationOptionsInterface
    ): Promise<Pagination<Following>> {
      const [results, total] = await this.followingRepository.findAndCount(
        {
          where: { followingId: followingId },
          take: options.limit,
          skip: options.page
        }
      )

      return new Pagination<Following>({
        results,
        total
      })
    }

  /**
   * Find a specific following entry
   * @param followerId
   * @param followingId
   */
    async findOne(followerId: string, followingId: string) {
      return await this.followingRepository.findOne({
        where: {
          followerId: followerId,
          followingId: followingId
        }
      })
    }


  /**
   * Soft deletes the following
   * @param followerId
   * @param followingId
   */
     async remove(followerId: string, followingId: string) {
      return await this.followingRepository
      .createQueryBuilder()
      .delete()
      .where({
        followerId: followerId,
        followingId: followingId
      })
      .execute()
    }

}

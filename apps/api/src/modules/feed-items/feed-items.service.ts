import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToClass } from 'class-transformer'
import { Brackets, Repository } from 'typeorm'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { CommonService } from '../common/services/common.service'
import { NotificationAction } from '../notifications/notifications.constants'
import { NotificationsService } from '../notifications/notifications.service'
import { PrivacySetting } from '../users-settings/users-settings.constants'
import { User, UserPublic } from '../users/entities/user.entity'
import { CreateFeedItemDto } from './dto/create-feed-item.dto'
import { FeedFilterDto } from './dto/feed-filter.dto'
import { FeedItem } from './entities/feed-item.entity'
import { FeedItemCategory, FeedItemType } from './feed-items.constants'

@Injectable()
export class FeedItemsService {
  constructor(
    @InjectRepository(FeedItem)
    private feedItemRepository: Repository<FeedItem>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private commonService: CommonService
  ) {}
  async create(createFeedItemDto: CreateFeedItemDto) {
    const [result, resultErr] = await tryAndCatch(
      this.feedItemRepository.save(
        this.feedItemRepository.create(createFeedItemDto)
      )
    )
    resultErr && console.error(resultErr.message)
    return result
  }

  async findAccessibleFeedItems(
    userId: string,
    requesterId: string,
    { limit, page }: PaginationQuery,
    filters: FeedFilterDto = {} as FeedFilterDto
  ) {
    const selfView = userId === requesterId

    let query = this.feedItemRepository
      .createQueryBuilder('feed_item')
      .leftJoinAndSelect('feed_item.user', 'user')
      .leftJoinAndSelect('user.avatar', 'user_avatar')
      .leftJoinAndSelect('feed_item.related_user', 'related_user')
      .leftJoinAndSelect('related_user.avatar', 'related_user_avatar')
      .leftJoinAndSelect('feed_item.reward', 'reward')
      .leftJoinAndSelect('feed_item.league', 'league')
      .leftJoinAndSelect('feed_item.health_activity', 'health_activity')
      .leftJoinAndSelect('health_activity.sport', 'sport')
      .leftJoinAndSelect('health_activity.images', 'health_activity_images')
      .leftJoinAndSelect('feed_item.goal_entry', 'goal_entry')
      .leftJoinAndSelect('feed_item.likes', 'likes')
      .leftJoinAndSelect('likes.avatar', 'likes_avatar')
      .orderBy('feed_item.created_at', 'DESC')
      .take(limit)
      .skip(limit * page)

    if (!selfView || filters.friends_activities) {
      if (filters.friends_activities) {
        // Where friends are included, only their health activities
        // & their daily goals are retrieved. This is only going
        // to be needed when a user views their own feed.
        query = query
          .leftJoin('user.following', 'f1')
          .leftJoin('f1.follower', 'follower')
          .leftJoin('f1.following', 'following')
          .leftJoin('following.settings', 'settings')
          .where('user.id = :userId', { userId })
          .orWhere(
            `(
            follower.id = :userId AND user.id = following.id
            AND (health_activity.id IS NOT NULL))`,
            {
              userId
            }
          )

        // Alternatively, this is a friend's feed (i.e. the user is viewing someone else's feed)
        // So we're only interested in checking that particular user's privacy
      } else {
        query = query
          .leftJoin('user.following', 'f1', 'f1.following.id = :requesterId', {
            requesterId
          })
          .leftJoin('user.settings', 'settings')
          .where('user.id = :userId', { userId })
      }

      query = query.andWhere(
        new Brackets((qb) =>
          qb
            .where(
              // Where health activities are public, all can be shown
              '(health_activity.id IS NOT NULL AND settings.privacy_activities = :privacy_public)',
              {
                privacy_public: PrivacySetting.Public
              }
            )

            .orWhere(
              // Where health activities are private, only show to people the user follows
              `(health_activity.id IS NOT NULL AND settings.privacy_activities = :privacy_following
                AND f1.following.id IS NOT NULL)`,
              {
                privacy_following: PrivacySetting.Following
              }
            )

            .orWhere(
              'goal_entry.id IS NOT NULL and settings.privacy_daily_statistics = :privacy_daily_statistics_public',
              {
                privacy_daily_statistics_public: PrivacySetting.Public
              }
            )
            .orWhere(
              `goal_entry.id IS NOT NULL and settings.privacy_daily_statistics = :privacy_daily_statistics_following
                AND f1.following.id IS NOT NULL`,
              {
                privacy_daily_statistics_following: PrivacySetting.Following
              }
            )

            // Nothing else can appear regardless of privacy
            .andWhere(
              `health_activity.id IS NOT NULL OR goal_entry.id IS NOT NULL`
            )
        )
      )
    } else {
      query = query.where('user.id = :userId', { userId })
    }

    // When a user looks at their own feed, they can choose to filter it
    // and exclude goals and updates.
    if (selfView) {
      if (!filters.my_goals) {
        query = query.andWhere('feed_item.category != :myGoals', {
          myGoals: FeedItemCategory.MyGoals
        })
      }
      if (!filters.my_updates) {
        query = query.andWhere('feed_item.category != :myUpdates', {
          myUpdates: FeedItemCategory.MyUpdates
        })
      }
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<FeedItem>({
      results: results.map((item) => {
        if (item.user) {
          item.user = this.commonService.getUserPublic(item.user as User)
        }
        if (item.related_user) {
          item.related_user = this.commonService.getUserPublic(
            item.related_user as User
          )
        }

        item.likes = item.likes.map((e) => {
          return plainToClass(UserPublic, e, {
            excludeExtraneousValues: true
          })
        })

        return item
      }),
      total
    })
  }

  async like(feedItemId: string, userId: string) {
    const liker = await this.usersRepository.findOne(userId, {
      relations: ['avatar']
    })
    const feedItem = await this.feedItemRepository.findOne(feedItemId, {
      relations: ['user', 'likes', 'health_activity', 'goal_entry', 'league']
    })

    // If the user already likes the post, ignore this.
    if ((feedItem.likes as User[]).filter((e) => e.id === liker.id).length) {
      return true
    }

    await this.feedItemRepository
      .createQueryBuilder()
      .relation(FeedItem, 'likes')
      .of(feedItemId)
      .add(userId)

    const notifyMeta = this.getFeedTypeForNotification(feedItem)

    // We only support certain feed items for notifications
    // to keep things less spammy.
    // We also prevent the user from gettting notifications
    // for self-likes.
    if (notifyMeta && feedItem.user.id !== liker.id) {
      await this.notificationsService.create({
        action: NotificationAction.ActivityLiked,
        subject: liker.name,
        subject_id: notifyMeta.subject_id,
        user: feedItem.user as User,
        avatar: liker.avatar,
        meta_value: notifyMeta.meta_value
      })
    }
  }

  async unLike(feedItemId: string, userId: string) {
    return this.feedItemRepository
      .createQueryBuilder()
      .relation(FeedItem, 'likes')
      .of(feedItemId)
      .remove(userId)
  }

  getFeedTypeForNotification(feedItem: FeedItem) {
    switch (feedItem.type) {
      case FeedItemType.DailyGoalReached:
        return {
          subject_id: feedItem.goal_entry.id,
          meta_value: 'goal achievement'
        }
      case FeedItemType.HealthActivity:
        return {
          subject_id: feedItem.health_activity.id,
          meta_value: 'activity'
        }
      case FeedItemType.LeagueWon:
        return { subject_id: feedItem.league.id, meta_value: 'league victory' }
    }
    return false
  }

  async remove(feedItemId: string, userId: string) {
    const feedItem = await this.feedItemRepository.findOne(feedItemId, {
      relations: ['user']
    })
    if (feedItem.user.id !== userId) {
      return false
    } else {
      return this.feedItemRepository.delete({ id: feedItemId })
    }
  }
}

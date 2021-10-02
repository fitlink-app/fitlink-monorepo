import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { Notification } from './entities/notification.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>
  ) {}

  /**
   * Create a new notification
   * @param userId
   * @param notificationIds
   * @returns
   */
  async create(notification: Partial<Notification>) {
    const notify = await this.notificationsRepository.save(notification)
  }

  /**
   * Sends a message to a single device
   */
  async sendNotificationByFCMToken() {}

  /**
   * Broadcasts the message to many devices
   * (up to 500)
   */
  async sendNotificationByFCMTokenArray() {}

  async findNotifications(userId: string, { limit, page }: PaginationQuery) {
    const [results, total] = await this.notificationsRepository.findAndCount({
      where: {
        user: {
          id: userId
        }
      },
      relations: ['user', 'league_invitations', 'feed_item'],
      take: limit,
      skip: limit * page
    })
    return new Pagination({
      results,
      total
    })
  }

  /**
   * Mark a specific list of notificationIds as seen
   * @param userId
   * @param notificationIds
   * @returns
   */
  async markSeen(userId: string, notificationIds: string[]) {
    return this.notificationsRepository.update(
      {
        id: In(notificationIds),
        user: {
          id: userId
        }
      },
      {
        seen: true
      }
    )
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { User } from '../users/entities/user.entity'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { Notification } from './entities/notification.entity'
import {
  NotificationAction,
  NotificationPayload
} from '../notifications/notifications.constants'
import { messaging } from 'firebase-admin'
import { FirebaseAdminService } from './firebase-admin.module'

@Injectable()
export class NotificationsService {
  messages = {
    [NotificationAction.LeagueInvitation]: `🎉 {meta_value} just invited you to join the league {subject}. Let's go!`,
    [NotificationAction.GoalAchieved]: `🎉 Nailed it. You just hit your {subject} goal. Keep it up.`,
    [NotificationAction.NewFollower]: `👋 {subject} followed you. Check it out.`,
    [NotificationAction.LeagueWon]: `👏 Winner! You just won the league {subject}. Check it out.`,
    [NotificationAction.LeagueReset]: `⏱ Heads up, the league {subject} has just reset. Go for it.`,
    [NotificationAction.LeagueEnding]: `📢 Remember, the league {subject} will end in 24 hours. You still have time.`,
    [NotificationAction.RankUp]: `👍 Nice. You ranked up to {subject}. Keep it going.`,
    [NotificationAction.RankDown]: `👎 Ouch! Your rank dropped to {subject}. You can do it.`,
    [NotificationAction.GoalProgressSteps]: `👣 So close to reaching your steps goal. Just a brisk walk should do it.`,
    [NotificationAction.ActivityLiked]: `❤️ {subject} just liked your {meta_value}. Check it out.`,
    [NotificationAction.RewardUnlocked]: `🎁 You just unlocked a new reward {subject}. Check it out.`,
    [NotificationAction.MondayReminder]: `🚀 It's a new week, and you've got goals. Let's go!`
  }

  titles = {
    [NotificationAction.LeagueInvitation]: `League invitation`,
    [NotificationAction.GoalAchieved]: `Goal achieved`,
    [NotificationAction.NewFollower]: `New follower`,
    [NotificationAction.LeagueWon]: `You won the league`,
    [NotificationAction.LeagueReset]: `A league was reset`,
    [NotificationAction.LeagueEnding]: `A league is ending`,
    [NotificationAction.RankUp]: `Rank updated`,
    [NotificationAction.RankDown]: `Rank updated`,
    [NotificationAction.GoalProgressSteps]: `Steps progress`,
    [NotificationAction.ActivityLiked]: `You've got love`,
    [NotificationAction.RewardUnlocked]: `Reward unlocked`,
    [NotificationAction.MondayReminder]: `It's a new week`
  }

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private firebase: FirebaseAdminService
  ) {}

  /**
   * Create a new notification
   * @param userId
   * @param notificationIds
   * @returns
   */
  async create(notification: CreateNotificationDto) {
    const title = this.formatTitle(notification.action)
    const notify = await this.notificationsRepository.manager.transaction(
      async (manager) => {
        const notificationsRepository = manager.getRepository(Notification)
        const usersRepository = manager.getRepository(User)
        const result = await notificationsRepository.save({
          ...notification,
          title
        })

        // Increment the user's notifications count
        await usersRepository.increment(
          { id: notification.user.id },
          'unread_notifications',
          1
        )

        return result
      }
    )

    const payload = this.formatPayload(notify)
    const tokens = notification.user.fcm_tokens
    if (payload && tokens && tokens.length > 0) {
      const response = await this.sendNotificationByFCMTokenArray(
        payload,
        tokens
      )
      await this.cleanTokens([notification.user], response)
      await this.notificationsRepository.update(notify.id, {
        push_succeeded: response.successCount > 0
      })
    }
    return notify
  }

  async sendAction(
    users: User[],
    action: NotificationAction,
    replace: {
      subject?: string
      meta_value?: string
    } = {},
    data: NodeJS.Dict<any> = {}
  ): Promise<{
    failureCount: number
    successCount: number
    usersTokensUpdated: number
  }> {
    let tokens: string[] = []
    users.forEach((user) => {
      tokens = tokens.concat(user.fcm_tokens)
    })

    if (!this.messages[action] || !this.titles[action]) {
      throw new BadRequestException()
    }

    if (tokens && tokens.length) {
      const body = this.messages[action]
        .replace('{subject}', replace.subject)
        .replace('{meta_value', replace.meta_value)

      const response = await this.sendNotificationByFCMTokenArray(
        {
          data: data,
          notification: {
            body,
            title: this.titles[action]
          }
        },
        tokens
      )

      // Format responses to find broken tokens and remove
      // them from those users.
      const usersTokensUpdated = await this.cleanTokens(users, response)

      return {
        failureCount: response.failureCount,
        successCount: response.successCount,
        usersTokensUpdated
      }
    }
  }

  async cleanTokens(users: User[], response: messaging.BatchResponse) {
    const indexes: { id: string; token: string }[] = []
    users.forEach((user) => {
      user.fcm_tokens.forEach((token) => {
        indexes.push({ id: user.id, token })
      })
    })

    const remove: NodeJS.Dict<string[]> = {}
    response.responses.forEach((each, index) => {
      if (!each.success) {
        const match = indexes[index]
        if (remove[indexes[index].id]) {
          remove[indexes[index].id].push(match.token)
        } else {
          remove[indexes[index].id] = [match.token]
        }
      }
    })

    const updates = await Promise.all(
      Object.keys(remove).map((userId) => {
        const badTokens = remove[userId]
        const user = users.filter((user) => user.id === userId)[0]
        return this.usersRepository.update(userId, {
          fcm_tokens: user.fcm_tokens.filter(
            (t) => badTokens.includes(t) === false
          )
        })
      })
    )

    return updates.length
  }

  async sendGenericMessage(
    userId: string,
    teamId: string,
    payload: NotificationPayload
  ) {
    const user = await this.usersRepository.findOne(userId, {
      relations: ['teams']
    })
    const tokens = user.fcm_tokens

    if (!user.teams.map((e) => e.id).includes(teamId)) {
      return false
    }

    if (payload && tokens && tokens.length > 0) {
      const response = await this.sendNotificationByFCMTokenArray(
        payload,
        tokens
      )
      const usersTokensUpdated = await this.cleanTokens([user], response)
      return {
        failureCount: response.failureCount,
        successCount: response.successCount,
        usersTokensUpdated
      }
    }

    return false
  }

  /**
   * Sends a message to a single device
   */
  async sendNotificationByFCMToken(
    payload: NotificationPayload,
    token: string
  ) {
    const message: messaging.Message = {
      ...payload,
      token
    }
    return this.firebase.app().messaging().send(message)
  }

  /**
   * Broadcasts the message to many devices
   * (up to 500)
   */
  async sendNotificationByFCMTokenArray(
    payload: NotificationPayload,
    tokens: string[]
  ) {
    const message: messaging.MulticastMessage = {
      ...payload,
      tokens
    }

    return this.firebase.app().messaging().sendMulticast(message)
  }

  async findNotifications(userId: string, { limit, page }: PaginationQuery) {
    const [results, total] = await this.notificationsRepository.findAndCount({
      where: {
        user: {
          id: userId
        }
      },
      relations: ['user', 'avatar'],
      order: { created_at: 'DESC' },
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
    await this.notificationsRepository.manager.transaction(async (manager) => {
      const notificationsRepository = manager.getRepository(Notification)
      return notificationsRepository.update(
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
    })

    const unreadCount = await this.notificationsRepository.count({
      where: {
        user: { id: userId },
        seen: false
      }
    })

    return this.usersRepository.update(userId, {
      unread_notifications: unreadCount
    })
  }

  /**
   * Mark all notifications for the user as seen
   * @param userId
   * @returns
   */
  async markAllSeen(userId: string) {
    return this.notificationsRepository.manager.transaction(async (manager) => {
      const notificationsRepository = manager.getRepository(Notification)
      const usersRepository = manager.getRepository(User)
      await notificationsRepository.update(
        {
          user: {
            id: userId
          }
        },
        {
          seen: true
        }
      )
      return usersRepository.update(
        {
          id: userId
        },
        {
          unread_notifications: 0
        }
      )
    })
  }

  formatTitle(action: NotificationAction) {
    return this.titles[action]
  }

  formatPayload(notification: Notification): NotificationPayload | false {
    let message = this.messages[notification.action]
    if (this.messages[notification.action]) {
      message = message
        .replace('{subject}', notification.subject)
        .replace('{meta_value}', notification.meta_value)
      return {
        notification: {
          title: notification.title,
          body: message
        }
      }
    } else {
      return false
    }
  }
}

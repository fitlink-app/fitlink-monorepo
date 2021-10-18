import { HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToClass } from 'class-transformer'
import { User, UserPublic } from '../../users/entities/user.entity'
import { zonedStartOfDay } from '../../../../../common/date/helpers'

export type UserExtended = User & {
  invitations?: any[]
}

@Injectable()
export class CommonService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Formats a user object to UserPublic
   * @param user
   * @returns
   */
  getUserPublic(user: UserExtended | User) {
    const userPublic = (user as unknown) as UserPublic

    if (user.following !== undefined) {
      userPublic.following = Boolean(user.following && user.following.length)
    }

    if (user.followers !== undefined) {
      userPublic.follower = Boolean(user.followers && user.followers.length)
    }

    if (user.leagues_invitations !== undefined) {
      userPublic.invited = Boolean(user.leagues_invitations.length)
    }

    // Convert today's goal percentage to 0
    // if the user hasn't had a health activity today.
    if (user.last_health_activity_at) {
      const startOfDay = zonedStartOfDay(user.timezone)
      if (user.last_health_activity_at < startOfDay) {
        userPublic.goal_percentage = 0
      }
    }

    return plainToClass(UserPublic, userPublic, {
      excludeExtraneousValues: true
    })
  }

  /**
   * Shorthand method to convert array of users
   * to UserPublic[]
   *
   * @param users
   * @returns UserPublic[]
   */
  mapUserPublic(users: UserExtended[]) {
    return users.map(this.getUserPublic)
  }

  async notifySlackJobs(title: string, result: NodeJS.Dict<any>, ms: number) {
    try {
      await this.httpService
        .post(this.configService.get('SLACK_WEBHOOK_JOBS_URL'), {
          text: `${title} job took ${ms}ms to run`,
          attachments: [
            { text: `\`\`\`${JSON.stringify(result, null, 2)}\`\`\`` }
          ]
        })
        .toPromise()
    } catch (e) {
      console.error(e)
    }
  }
}

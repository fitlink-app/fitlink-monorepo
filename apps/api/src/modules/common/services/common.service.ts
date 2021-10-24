import { HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToClass } from 'class-transformer'
import { User, UserPublic } from '../../users/entities/user.entity'
import { zonedStartOfDay } from '../../../../../common/date/helpers'
import { DeepLinkType } from 'apps/api/src/constants/deep-links'

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

    if (user.leagues && user.leagues.length) {
      userPublic.league_names = user.leagues.map((e) => e.name)
    }

    if (user.teams && user.teams.length) {
      userPublic.team_name = user.teams[0].name
    }

    // If available, store user's privacy settings
    if (user.settings) {
      userPublic.privacy_daily_statistics =
        user.settings.privacy_daily_statistics
      userPublic.privacy_activities = user.settings.privacy_activities
    }

    // Convert today's goal percentage to 0
    // if the user hasn't had a health activity today.
    if (user.last_lifestyle_activity_at) {
      const startOfDay = zonedStartOfDay(user.timezone)
      if (user.last_lifestyle_activity_at < startOfDay) {
        userPublic.goal_percentage = 0
      }
      // As a fallback, if their lifestyle activity isn't set
      // e.g. due to data migration, this should be zero.
    } else {
      userPublic.goal_percentage = 0
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

  generateDynamicLink = (
    type: DeepLinkType,
    params: { [key: string]: string },
    otherPlatformLink?: string,
    skipAppPreview?: boolean
  ) => {
    const link = new URL(this.configService.get('DEEP_LINK_URL'))

    // Add type param to the link
    link.searchParams.append('type', type)

    // Add params to the "link", this URL will be received by the mobile app
    for (const key in params) {
      link.searchParams.append(key, params[key])
    }

    // Construct the dynamic link
    const url = new URL(this.configService.get('DEEP_LINK_URL'))

    const linkEncoded = encodeURI(link.toString())
    url.searchParams.append('link', linkEncoded)

    // Android values
    url.searchParams.append('apn', this.configService.get('ANDROID_BUNDLE_ID'))

    // iOS Values
    url.searchParams.append('ibi', this.configService.get('IOS_BUNDLE_ID'))
    url.searchParams.append('isi', this.configService.get('IOS_APP_ID'))

    if (otherPlatformLink) url.searchParams.append('ofl', otherPlatformLink)
    if (skipAppPreview) url.searchParams.append('efr', '1')

    return url.toString()
  }
}

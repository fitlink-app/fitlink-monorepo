import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { User, UserPublic } from '../../users/entities/user.entity'

@Injectable()
export class CommonService {
  constructor() {}

  /**
   * Formats a user object to UserPublic
   * @param user
   * @returns
   */
  getUserPublic(
    user: User & {
      invitations?: any[]
    }
  ) {
    const userPublic = (user as unknown) as UserPublic

    userPublic.following = Boolean(
      user.following && user.following.length === 1
    )
    userPublic.follower = Boolean(user.followers && user.followers.length === 1)

    if (user.leagues_invitations) {
      userPublic.invited = Boolean(user.leagues_invitations.length === 1)
    }

    return plainToClass(UserPublic, userPublic, {
      excludeExtraneousValues: true
    })
  }
}

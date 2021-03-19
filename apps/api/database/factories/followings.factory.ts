import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { User } from '../../src/modules/users/entities/user.entity'

interface Context {
  followerUser: User,
  followingUser: User
}

define(Following, (faker: typeof Faker, context: Context) => {
  const entry = new Following()
  entry.follower = context.followerUser
  entry.following = context.followingUser
  return entry
})

import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Team } from '../../src/modules/teams/entities/team.entity'
import {
  UserRole,
  Roles
} from '../../src/modules/user-roles/entities/user-role.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { User } from '../../src/modules/users/entities/user.entity'

interface Context {
  user: User
  organisation?: Organisation
  subscription?: Subscription
  team?: Team
  role: Roles
}

define(UserRole, (_faker: typeof Faker, context: Context) => {
  const role = new UserRole()
  role.user = context.user
  role.role = context.role
  role.organisation = context.organisation
  role.subscription = context.subscription
  role.team = context.team
  return role
})

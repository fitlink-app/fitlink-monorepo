import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { User } from '../../src/modules/users/entities/user.entity'

interface Context {
  team: Team
}

define(User, (faker: typeof Faker, context: Context) => {
  const user = new User()
  user.name = faker.name.findName()
  user.email = faker.internet.userName() + '-example@fitlinkapp.com'
  user.password = '$2a$10$SxsiyEPj2gjEgufzMiWTWuej0Cld6IzPT/59.0.Y6xSEosQ856u6m'
  return user
})

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
  user.email =
    faker.internet.userName().toLowerCase() +
    faker.random.number(100) +
    '-example@fitlinkapp.com'
  user.password = '$2b$10$q094HiCKPD8anURpGzim7eRdSRAKlp806SY9SnD9bbWIenXf1w3yC'
  return user
})

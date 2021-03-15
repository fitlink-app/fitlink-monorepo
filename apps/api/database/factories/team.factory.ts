import { Team } from '../../src/modules/teams/entities/team.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'

interface Context {
  organisation: Organisation
}

define(Team, (faker: typeof Faker, context: Context) => {
  const team = new Team()
  team.name = faker.company.companyName()
  team.organisation = context.organisation
  return team
})

import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'

define(Organisation, (faker: typeof Faker) => {
  const org = new Organisation()
  org.name = faker.company.companyName()
  return org
})

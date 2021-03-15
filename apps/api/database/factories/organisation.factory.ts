import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'

define(Organisation, (faker: typeof Faker) => {
  const org = new Organisation()
  org.billing_address_1 = faker.address.streetAddress()
  org.billing_address_2 = faker.address.secondaryAddress()
  org.billing_city = faker.address.city()
  org.billing_country = faker.address.country()
  org.billing_state = faker.address.state()
  org.billing_country_code = faker.address.countryCode()
  org.name = faker.company.companyName()
  return org
})

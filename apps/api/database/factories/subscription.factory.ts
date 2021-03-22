import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { define } from 'typeorm-seeding'
import Faker from 'faker'

import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'

interface Context {
  organisation: Organisation
}

define(Subscription, (faker: typeof Faker, context: Context) => {
  const subscription = new Subscription()
  subscription.organisation = context.organisation
  subscription.billing_entity = context.organisation.name
  subscription.billing_address_1 = faker.address.streetAddress()
  subscription.billing_address_2 = faker.address.secondaryAddress()
  subscription.billing_city = 'London'
  subscription.billing_country = 'United Kingdom'
  subscription.billing_state = 'London'
  subscription.billing_country_code = 'GB'
  subscription.billing_postcode = 'SW1A 1AA'
  subscription.default = true
  return subscription
})

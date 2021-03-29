import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Activity } from '../../src/modules/activities/entities/activity.entity'

define(Activity, (faker: typeof Faker) => {
  const soon = faker.date.recent(-1)
  const activity = new Activity()
  activity.name = faker.name.jobDescriptor()
  activity.meeting_point_text = faker.address.streetAddress()

  const lat = -1.2578499 + 0.05 * Math.random()
  const lng = 51.7520131 + 0.05 * Math.random()

  activity.meeting_point = {
    type: 'Point',
    coordinates: [lat, lng]
  }
  activity.description = faker.lorem.sentences(5)
  activity.date = `${faker.date.weekday()} at ${soon.getHours()}:${soon.getMinutes()}`
  activity.images = []
  activity.organizer_name = faker.company.companyName()
  activity.organizer_url = faker.internet.url()
  activity.cost = faker.finance.currencySymbol() + faker.finance.amount(5, 40)
  return activity
})

import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { Image } from '../../src/modules/images/entities/image.entity'
import { ActivityType } from '../../src/modules/activities/activities.constants'

define(Activity, (faker: typeof Faker) => {
  const soon = faker.date.recent(-1)
  const activity = new Activity()
  const organiserImage = new Image()
  organiserImage.url = faker.image.food()

  organiserImage.url_128x128 = faker.image.food(128, 128)
  organiserImage.url_512x512 = faker.image.food(512, 512)
  organiserImage.url_640x360 = faker.image.food(640, 360)

  activity.name = faker.name.jobDescriptor()
  activity.meeting_point_text = faker.address.streetAddress()

  const lat = 51.7520131 + 0.05 * Math.random()
  const lng = -1.2578499 + 0.05 * Math.random()

  activity.meeting_point = {
    type: 'Point',
    coordinates: [lat, lng]
  }
  activity.description = faker.lorem.sentences(5)
  activity.date = `${faker.date.weekday()} at ${soon.getHours()}:${soon.getMinutes()}`
  activity.images = []
  activity.organizer_name = faker.company.companyName()
  activity.organizer_url = faker.internet.url()
  activity.organizer_image = organiserImage
  activity.cost = faker.finance.currencySymbol() + faker.finance.amount(5, 40)
  activity.type = faker.random.arrayElement([
    'class',
    'group',
    'route'
  ]) as ActivityType
  return activity
})

import { define } from 'typeorm-seeding'
import Faker from 'faker'
import {
  Image,
  ImageType
} from '../../src/modules/images/entities/image.entity'

define(Image, (faker: typeof Faker) => {
  const image = new Image()
  image.url = faker.image.food(800, 600)
  image.url_128x128 = faker.image.food(128, 128)
  image.url_512x512 = faker.image.food(512, 512)
  image.url_640x360 = faker.image.food(640, 360)
  image.width = 800
  image.height = 600
  image.type = ImageType.Standard
  return image
})

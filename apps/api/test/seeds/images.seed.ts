import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Image } from '../../src/modules/images/entities/image.entity'

const IMAGES_COUNT = 1

export async function ImagesSetup(
  name: string,
  count = IMAGES_COUNT
): Promise<Image[]> {
  class Setup implements Seeder {
    public async run(factory: Factory): Promise<any> {
      return factory(Image)().createMany(count, {
        alt: name
      })
    }
  }

  return runSeeder(Setup)
}

export async function ImagesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Image).delete({
        alt: name
      })
    }
  }

  return runSeeder(Teardown)
}

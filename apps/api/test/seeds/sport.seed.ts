import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { Factory, runSeeder, Seeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'

export async function SportSetup(fields: Partial<Sport>): Promise<Sport> {
  class Setup implements Seeder {
    public async run(factory: Factory): Promise<any> {
      /**
       * This seeded data lives only to be tested on die and then be reborn.
       */
      return factory(Sport)().create(fields)
    }
  }

  return runSeeder(Setup)
}

export async function SportsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Sport).delete({ name })
    }
  }

  return runSeeder(Teardown)
}

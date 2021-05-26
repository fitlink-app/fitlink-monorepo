import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'

const COUNT_ORGANISATIONS = 2

export async function OrganisationsSetup(
  name: string,
  count = COUNT_ORGANISATIONS
): Promise<Organisation[]> {
  class Setup implements Seeder {
    connection: Connection

    public async run(factory: Factory): Promise<any> {
      return factory(Organisation)().createMany(count, { name })
    }
  }

  return runSeeder(Setup)
}

export async function OrganisationsTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    connection: Connection

    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Organisation).delete({ name })
    }
  }

  await runSeeder(Teardown)
}

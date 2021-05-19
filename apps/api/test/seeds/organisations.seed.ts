import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'

const COUNT_ORGANISATIONS = 2

export const name = 'Test Organisation'

export class OrganisationsSetup implements Seeder {
  connection: Connection

  public async run(factory: Factory): Promise<any> {
    await factory(Organisation)().createMany(COUNT_ORGANISATIONS, {
      name
    })
  }
}

export class OrganisationsTeardown implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(Organisation).delete({
      name
    })
  }
}

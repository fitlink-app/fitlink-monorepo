import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { Factory, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'

export default class TestingSportsSeed implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * This seeded data lives only to be tested on die and then be reborn.
     */
    await factory(Sport)().create({
      name: 'Swimming',
      name_key: 'swimming',
      singular: 'swim',
      plural: 'swims'
    })
  }
}

export class DeleteSports implements Seeder {
  public async run(_factory: Factory, connection: Connection): Promise<any> {
    const sportRepository: Repository<Sport> = connection.getRepository(Sport)
    await sportRepository.delete({ name: 'Swimming' })
  }
}

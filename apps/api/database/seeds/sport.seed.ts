import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

export default class CreateSports implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const sportRepository = connection.getRepository(Sport)
    /**
     * Create sports list
     */
    if (!(await sportRepository.findOne({ name_key: 'running' }))) {
      await factory(Sport)().create({
        name: 'Running',
        name_key: 'running',
        singular: 'run',
        plural: 'runs'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'cycling' }))) {
      await factory(Sport)().create({
        name: 'Cycling',
        name_key: 'cycling',
        singular: 'ride',
        plural: 'rides'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'walking' }))) {
      await factory(Sport)().create({
        name: 'Walking',
        name_key: 'walking',
        singular: 'walking',
        plural: 'walkings'
      })
    }
  }
}

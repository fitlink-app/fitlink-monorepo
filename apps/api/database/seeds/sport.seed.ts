import { Seeder, Factory } from 'typeorm-seeding'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

export default class CreateSports implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * Create sports list
     */
    await factory(Sport)().create({
      name: 'Running',
      name_key: 'running',
      singular: 'run',
      plural: 'runs'
    })

    await factory(Sport)().create({
      name: 'Cycling',
      name_key: 'cycling',
      singular: 'ride',
      plural: 'rides'
    })
  }
}

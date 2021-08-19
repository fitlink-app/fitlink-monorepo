import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

export default class CreateSports implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const sportRepository = connection.getRepository(Sport)
    /**
     * Create sports list
     */
    if (!(await sportRepository.findOne({ name_key: 'skiing' }))) {
      await factory(Sport)().create({
        name: 'Skiing',
        name_key: 'skiing',
        singular: 'ski',
        plural: 'skis'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'hiking' }))) {
      await factory(Sport)().create({
        name: 'Hiking',
        name_key: 'hiking',
        singular: 'hike',
        plural: 'hikes'
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

    if (!(await sportRepository.findOne({ name_key: 'crossfitTraining' }))) {
      await factory(Sport)().create({
        name: 'Crossfit',
        name_key: 'crossfitTraining',
        singular: 'crossfit workout',
        plural: 'crossfit workouts'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'rowing' }))) {
      await factory(Sport)().create({
        name: 'Rowing',
        name_key: 'rowing',
        singular: 'row',
        plural: 'rows'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'snowboarding' }))) {
      await factory(Sport)().create({
        name: 'Snowboarding',
        name_key: 'snowboarding',
        singular: 'snowboard',
        plural: 'snowboards'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'surfing' }))) {
      await factory(Sport)().create({
        name: 'Surfing',
        name_key: 'surfing',
        singular: 'surf',
        plural: 'surfs'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'walking' }))) {
      await factory(Sport)().create({
        name: 'Walking',
        name_key: 'walking',
        singular: 'walk',
        plural: 'walks'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'yoga' }))) {
      await factory(Sport)().create({
        name: 'Yoga',
        name_key: 'yoga',
        singular: 'yoga session',
        plural: 'yoga sessions'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'running' }))) {
      await factory(Sport)().create({
        name: 'Running',
        name_key: 'running',
        singular: 'run',
        plural: 'runs'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'golf' }))) {
      await factory(Sport)().create({
        name: 'Golf',
        name_key: 'golf',
        singular: 'golf game',
        plural: 'golf games'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'spinning' }))) {
      await factory(Sport)().create({
        name: 'Spinning',
        name_key: 'spinning',
        singular: 'spinning session',
        plural: 'spinning sessions'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'spinning' }))) {
      await factory(Sport)().create({
        name: 'Weightlifting',
        name_key: 'weightLifting',
        singular: 'weightlifting session',
        plural: 'weightlifting sessions'
      })
    }

    if (!(await sportRepository.findOne({ name_key: 'spinning' }))) {
      await factory(Sport)().create({
        name: 'Tennis',
        name_key: 'tennis',
        singular: 'tennis game',
        plural: 'tennis games'
      })
    }
  }
}

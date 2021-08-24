import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

/**
 * Create sports list
 *
 * Run `yarn migration:seed:sports`
 *
 * This must be done before migrating from Firebase legacy.
 *
 * Sports are required to process health activity events
 * and must match with keys defined in code when processing
 * from Strava & Fitbit.
 */

export default class CreateSports implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const sportRepository = connection.getRepository(Sport)
    const sports = await sportRepository.find()
    const create: Partial<Sport>[] = []

    if (!exists('skiing')) {
      create.push({
        name: 'Skiing',
        name_key: 'skiing',
        singular: 'ski',
        plural: 'skis'
      })
    }

    if (!exists('hiking')) {
      create.push({
        name: 'Hiking',
        name_key: 'hiking',
        singular: 'hike',
        plural: 'hikes'
      })
    }

    if (!exists('cycling')) {
      create.push({
        name: 'Cycling',
        name_key: 'cycling',
        singular: 'ride',
        plural: 'rides'
      })
    }

    if (!exists('crossfitTraining')) {
      create.push({
        name: 'Crossfit',
        name_key: 'crossfitTraining',
        singular: 'crossfit workout',
        plural: 'crossfit workouts'
      })
    }

    if (!exists('rowing')) {
      create.push({
        name: 'Rowing',
        name_key: 'rowing',
        singular: 'row',
        plural: 'rows'
      })
    }

    if (!exists('snowboarding')) {
      create.push({
        name: 'Snowboarding',
        name_key: 'snowboarding',
        singular: 'snowboard',
        plural: 'snowboards'
      })
    }

    if (!exists('surfing')) {
      create.push({
        name: 'Surfing',
        name_key: 'surfing',
        singular: 'surf',
        plural: 'surfs'
      })
    }

    if (!exists('walking')) {
      create.push({
        name: 'Walking',
        name_key: 'walking',
        singular: 'walk',
        plural: 'walks'
      })
    }

    if (!exists('steps')) {
      create.push({
        name: 'Steps',
        name_key: 'steps',
        singular: 'step',
        plural: 'steps'
      })
    }

    if (!exists('yoga')) {
      create.push({
        name: 'Yoga',
        name_key: 'yoga',
        singular: 'yoga session',
        plural: 'yoga sessions'
      })
    }

    if (!exists('running')) {
      create.push({
        name: 'Running',
        name_key: 'running',
        singular: 'run',
        plural: 'runs'
      })
    }

    if (!exists('golf')) {
      create.push({
        name: 'Golf',
        name_key: 'golf',
        singular: 'golf game',
        plural: 'golf games'
      })
    }

    if (!exists('spinning')) {
      create.push({
        name: 'Spinning',
        name_key: 'spinning',
        singular: 'spinning session',
        plural: 'spinning sessions'
      })
    }

    if (!exists('weightLifting')) {
      create.push({
        name: 'Weightlifting',
        name_key: 'weightLifting',
        singular: 'weightlifting session',
        plural: 'weightlifting sessions'
      })
    }

    if (!exists('tennis')) {
      create.push({
        name: 'Tennis',
        name_key: 'tennis',
        singular: 'tennis game',
        plural: 'tennis games'
      })
    }

    if (!exists('swimming')) {
      create.push({
        name: 'Swimming',
        name_key: 'swimming',
        singular: 'swim',
        plural: 'swims'
      })
    }

    await Promise.all(create.map((e) => factory(Sport)().create(e)))

    function exists(nameKey: string) {
      return sports.filter((e) => e.name_key === nameKey).length === 1
    }
  }
}

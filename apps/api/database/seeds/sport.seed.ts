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

    create.push({
      name: 'Skiing',
      name_key: 'skiing',
      singular: 'ski',
      plural: 'skis',
      image_url: 'https://my.fitlinkapp.com/health-activities/skiing.jpg',
      icon_url: iconUrls.skiing
    })

    create.push({
      name: 'Hiking',
      name_key: 'hiking',
      singular: 'hike',
      plural: 'hikes',
      show_pace: true,
      image_url: 'https://my.fitlinkapp.com/health-activities/hiking.jpg',
      icon_url: iconUrls.hiking
    })

    create.push({
      name: 'Cycling',
      name_key: 'cycling',
      singular: 'ride',
      plural: 'rides',
      show_pace: true,
      image_url: 'https://my.fitlinkapp.com/health-activities/cycling.jpg',
      icon_url: iconUrls.cycling
    })

    create.push({
      name: 'Crossfit',
      name_key: 'crossfitTraining',
      singular: 'crossfit workout',
      plural: 'crossfit workouts',
      image_url: 'https://my.fitlinkapp.com/health-activities/crossfit.jpg',
      icon_url: iconUrls.crossfit
    })

    create.push({
      name: 'Rowing',
      name_key: 'rowing',
      singular: 'row',
      plural: 'rows',
      show_pace: true,
      image_url: 'https://my.fitlinkapp.com/health-activities/rowing.jpg',
      icon_url: iconUrls.rowing
    })

    create.push({
      name: 'Snowboarding',
      name_key: 'snowboarding',
      singular: 'snowboard',
      plural: 'snowboards',
      image_url: 'https://my.fitlinkapp.com/health-activities/snowboarding.jpg',
      icon_url: iconUrls.snowboarding
    })

    create.push({
      name: 'Surfing',
      name_key: 'surfing',
      singular: 'surf',
      plural: 'surfs',
      image_url: 'https://my.fitlinkapp.com/health-activities/surfing.jpg',
      icon_url: iconUrls.surfing
    })

    create.push({
      name: 'Walking',
      name_key: 'walking',
      singular: 'walk',
      plural: 'walks',
      image_url: 'https://my.fitlinkapp.com/health-activities/walking.jpg',
      show_pace: true,
      icon_url: iconUrls.walking
    })

    create.push({
      name: 'Steps',
      name_key: 'steps',
      singular: 'step',
      plural: 'steps',
      icon_url: iconUrls.walking
    })

    create.push({
      name: 'Yoga',
      name_key: 'yoga',
      singular: 'yoga session',
      plural: 'yoga sessions',
      image_url: 'https://my.fitlinkapp.com/health-activities/yoga.jpg',
      icon_url: iconUrls.yoga
    })

    create.push({
      name: 'Running',
      name_key: 'running',
      singular: 'run',
      plural: 'runs',
      show_pace: true,
      image_url: 'https://my.fitlinkapp.com/health-activities/running.jpg',
      icon_url: iconUrls.running
    })

    create.push({
      name: 'Golf',
      name_key: 'golf',
      singular: 'golf game',
      plural: 'golf games',
      icon_url: iconUrls.golf
    })

    create.push({
      name: 'Spinning',
      name_key: 'spinning',
      singular: 'spinning session',
      plural: 'spinning sessions',
      icon_url: iconUrls.cycling
    })

    create.push({
      name: 'Weightlifting',
      name_key: 'weightLifting',
      singular: 'weightlifting session',
      plural: 'weightlifting sessions',
      icon_url: iconUrls.crossfit
    })

    create.push({
      name: 'Tennis',
      name_key: 'tennis',
      singular: 'tennis game',
      plural: 'tennis games',
      icon_url: iconUrls.tennis
    })

    create.push({
      name: 'Swimming',
      name_key: 'swimming',
      singular: 'swim',
      plural: 'swims',
      show_pace: true,
      image_url: 'https://my.fitlinkapp.com/health-activities/swimming.jpg',
      icon_url: iconUrls.swimming
    })

    create.push({
      name: 'HIIT',
      name_key: 'highIntensityIntervalTraining',
      singular: 'HIIT workout',
      plural: 'HIIIT workouts',
      image_url: 'https://my.fitlinkapp.com/health-activities/hiit.jpg',
      icon_url: iconUrls.hiit
    })

    await Promise.all(
      create.map(async (each) => {
        if (exists(each.name_key)) {
          await sportRepository.update(
            {
              name_key: each.name_key
            },
            each
          )
          return each
        } else {
          await factory(Sport)().create(each)
          return each
        }
      })
    )

    function exists(nameKey: string) {
      return sports.filter((e) => e.name_key === nameKey).length === 1
    }
  }
}

const iconUrls = {
  running: 'https://my.fitlinkapp.com/health-activities/icons/running.png',
  skiing: 'https://my.fitlinkapp.com/health-activities/icons/skiing.png',
  hiking: 'https://my.fitlinkapp.com/health-activities/icons/hiking.png',
  cycling: 'https://my.fitlinkapp.com/health-activities/icons/cycling.png',
  crossfit: 'https://my.fitlinkapp.com/health-activities/icons/crossfit.png',
  rowing: 'https://my.fitlinkapp.com/health-activities/icons/rowing.png',
  snowboarding:
    'https://my.fitlinkapp.com/health-activities/icons/snowboarding.png',
  surfing: 'https://my.fitlinkapp.com/health-activities/icons/surfing.png',
  walking: 'https://my.fitlinkapp.com/health-activities/icons/walking.png',
  yoga: 'https://my.fitlinkapp.com/health-activities/icons/yoga.png',
  swimming: 'https://my.fitlinkapp.com/health-activities/icons/swimming.png',
  hiit: 'https://my.fitlinkapp.com/health-activities/icons/hiit.png',
  tennis: 'https://my.fitlinkapp.com/health-activities/icons/tennis.png',
  golf: 'https://my.fitlinkapp.com/health-activities/icons/golf.png'
}

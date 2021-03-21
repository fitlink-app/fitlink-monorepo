import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { Seeder, Factory } from 'typeorm-seeding'

export default class CreateActivities implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * Create activities
     */
    console.log('here')
    await factory(Activity)().createMany(43)
  }
}

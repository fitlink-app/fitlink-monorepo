import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'

const name = 'Test Activity'

export class ActivitiesSetup implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * Create activities
     */
    await factory(Activity)().createMany(43, {
      name
    })
  }
}

export class ActivitiesTeardown implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(Activity).delete({
      name
    })
  }
}

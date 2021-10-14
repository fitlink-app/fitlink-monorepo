import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { Seeder, Factory, runSeeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'

export async function ActivitiesSetup(
  name: string,
  count = 43,
  override: Partial<Activity> = {}
): Promise<Activity[]> {
  class Setup implements Seeder {
    public async run(factory: Factory): Promise<any> {
      /**
       * Create activities
       */
      return factory(Activity)().createMany(count, {
        name,
        ...override
      })
    }
  }

  return runSeeder(Setup)
}

export async function ActivitiesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(Activity).delete({
        name
      })
    }
  }
  return runSeeder(Teardown)
}

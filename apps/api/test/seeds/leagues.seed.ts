import { Factory, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'
import { League } from '../../src/modules/leagues/entities/league.entity'

export default class TestingLeagueSeed implements Seeder {
  public async run(factory: Factory): Promise<any> {
    /**
     * This seeded data lives only to be tested on die and then be reborn.
     */
    await factory(League)().create({
      name: 'Dying League',
      description: 'League Description'
    })
  }
}

export class DeleteLeagueSeed implements Seeder {
  public async run(_factory: Factory, connection: Connection): Promise<any> {
    const leagueRepository: Repository<League> = connection.getRepository(
      League
    )
    await leagueRepository.delete({ name: 'Dying League' })
  }
}

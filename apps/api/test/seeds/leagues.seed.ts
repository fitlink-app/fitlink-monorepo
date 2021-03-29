import { Factory, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'

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

export class TeamAssignedLeague implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    /**
     * This is seed lives only to be tested on die and be reborn.
     * And It's already assigned to a team.
     */

    const teamRepository: Repository<Team> = connection.getRepository(Team)
    const team = await teamRepository.find()

    await factory(League)().create({
      name: 'Team Assigned Dying League',
      description: 'League Description',
      team: team[0]
    })
  }
}

export class DeleteTeamAssignedLeague implements Seeder {
  public async run(_factory: Factory, connection: Connection): Promise<any> {
    const leagueRepository: Repository<League> = connection.getRepository(
      League
    )
    await leagueRepository.delete({ name: 'Team Assigned Dying League' })
  }
}

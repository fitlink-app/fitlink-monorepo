import { Seeder, Factory } from 'typeorm-seeding'
import { Connection } from 'typeorm'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import * as chalk from 'chalk'

const COUNT_TEAMS = 2

export const name = 'Test Team'

export class TeamsSetup implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const organisation = await connection.getRepository(Organisation).findOne()

    if (!organisation) {
      console.log(chalk.bgRed('Organisation seed must be run before team seed'))
    }

    await factory(Team)({ organisation }).createMany(COUNT_TEAMS, {
      name
    })
  }
}

export class TeamsTeardown implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(Team).delete({
      name
    })
  }
}
